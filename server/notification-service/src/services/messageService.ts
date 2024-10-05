import { io } from "../..";
import chatGroupModel from "../models/chatGroupModel";
import messageModel from "../models/messageModel";
import { userSocketMap } from "../socket";

export const sendMessageService = async (
  senderId: string,
  receiverId: string,
  messageContent: { text?: string, imageUrl?: string, emoji?: string, productLink?: string }
) => {
  try {
    // Kiểm tra xem đã có chatGroup giữa hai người hay chưa
    let chatGroup = await chatGroupModel.findOne({
      members: { $all: [senderId, receiverId] },
      isPrivate: true, // kiểm tra đây là nhóm chat riêng tư giữa 2 người
    }).exec();

    // Nếu không tồn tại, tạo một nhóm chat mới
    if (!chatGroup) {
      chatGroup = new chatGroupModel({
        members: [senderId, receiverId],
        isPrivate: true, // đánh dấu là nhóm chat giữa hai người
        createdBy: senderId,
        groupName: `${senderId}-${receiverId}`,
      });

      await chatGroup.save();
      console.log(`New chat group created between ${senderId} and ${receiverId}`);
    }

    // Tạo tin nhắn mới trong nhóm chat
    const newMessage = await messageModel.create({
      senderId,
      chatGroup: chatGroup._id,
      text: messageContent.text || null,
      imageUrl: messageContent.imageUrl || null,
      emoji: messageContent.emoji || null,
      productLink: messageContent.productLink || null,
    });

    // Cập nhật tin nhắn cuối cùng cho nhóm chat
    chatGroup.lastMessage = newMessage._id;
    await chatGroup.save();

    // Gửi tin nhắn cho cả hai người dùng
    [senderId, receiverId].forEach((userId) => {
      const receiverSocketId = userSocketMap.get(userId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', {
          chatGroupId: chatGroup._id,
          message: newMessage,
        });
      }
    });

    console.log(`Message from ${senderId} to chat group ${chatGroup._id}: ${messageContent.text || 'media'}`);

    return newMessage;

  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error((error as Error).message);
  }
};
