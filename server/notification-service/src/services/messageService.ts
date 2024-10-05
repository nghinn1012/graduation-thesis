import { io } from "../..";
import chatGroupModel from "../models/chatGroupModel";
import messageModel from "../models/messageModel";
import { userSocketMap } from "../socket";

export const sendMessageService = async (
  senderId: string,
  receiverIds: string[], // Treating receiverIds as an array
  messageContent: { text?: string, imageUrl?: string, emoji?: string, productLink?: string },
  chatGroupId?: string,  // Optional: Chat group ID might be passed
) => {
  try {
    let chatGroup;

    // If chatGroupId is provided, use it directly
    if (chatGroupId) {
      chatGroup = await chatGroupModel.findById(chatGroupId).exec();
    } else {
      // If no chatGroupId, find the existing chat group or create a new one
      chatGroup = await chatGroupModel.findOne({
        members: { $all: [senderId, ...receiverIds] }, // Ensure all members are in the group
        isPrivate: receiverIds.length === 1,  // If there's only one receiver, it's a private chat
      }).exec();

      // If no existing chat group, create a new one
      if (!chatGroup) {
        chatGroup = new chatGroupModel({
          members: [senderId, ...receiverIds],
          isPrivate: receiverIds.length === 1,  // Private if 1 receiver, otherwise group chat
          createdBy: senderId,
          groupName: `Group: ${[senderId, ...receiverIds].join(', ')}`,
        });

        await chatGroup.save();
        console.log(`New chat group created between ${senderId} and ${receiverIds.join(', ')}`);
      } else {
        console.log(`Existing chat group found for ${senderId} and ${receiverIds.join(', ')}`);
      }
    }

    if (!chatGroup) {
      throw new Error("Chat group not found");
    }

    // Create the message
    const newMessage = await messageModel.create({
      senderId,
      chatGroup: chatGroup._id,  // Assign to the group
      text: messageContent.text || null,
      imageUrl: messageContent.imageUrl || null,
      emoji: messageContent.emoji || null,
      productLink: messageContent.productLink || null,
    });

    // Update the lastMessage in the chat group
    chatGroup.lastMessage = newMessage._id;
    await chatGroup.save();

    // Notify all involved users (sender + receivers) via WebSocket
    [senderId, ...receiverIds].forEach((userId) => {
      const receiverSocketId = userSocketMap.get(userId); // Find user's socket ID

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


export const getMessagesService = async (chatGroupId: string, userId: string) => {
  try {
    const chatGroup = await chatGroupModel.findById(chatGroupId).exec();
    if (!chatGroup) {
      throw new Error("Chat group not found");
    }

    const messages = await messageModel.find({ chatGroup: chatGroupId })
      .sort({ createdAt: 1 })
      .exec();

    return messages;
  } catch (error) {
    throw new Error(`Error fetching messages: ${(error as Error).message}`);
  }
};

export const getChatGroupsService = async (userId: string) => {
  try {
    const chatGroups = await chatGroupModel.find({ members: userId }).exec();
    return chatGroups;
  } catch (error) {
    throw new Error(`Error fetching chat groups: ${(error as Error).message}`);
  }
}
