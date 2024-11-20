import { io } from "../..";
import { createGroupChat } from "../data/interface/message_interface";
import chatGroupModel from "../models/chatGroupModel";
import messageModel from "../models/messageModel";
import { userSocketMap } from "../socket";
import { deleteImageFromCloudinary, extractPublicIdFromUrl, uploadImageToCloudinary } from "./imagesuploader.services";

export const sendMessageService = async (
  senderId: string,
  receiverId: string | string[], // Có thể là một string hoặc một mảng string
  messageContent: { text?: string, imageUrl?: string, emoji?: string, productLink?: string },
  chatGroupId?: string,
) => {
  try {
    let chatGroup;
    const receiverIds = Array.isArray(receiverId) ? receiverId : [receiverId];

    if (chatGroupId) {
      chatGroup = await chatGroupModel.findById(chatGroupId).exec();
    } else {
      const allMembers = [senderId, ...receiverIds];
      chatGroup = await chatGroupModel.findOne({
        members: { $all: allMembers, $size: allMembers.length }
      }).exec();

      if (!chatGroup) {
        chatGroup = new chatGroupModel({
          members: allMembers,
          isPrivate: receiverIds.length === 1,
          createdBy: senderId,
          groupName: receiverIds.length === 1
            ? `Private: ${senderId} and ${receiverIds[0]}`
            : `Group: ${allMembers.join(', ')}`,
        });

        await chatGroup.save();
        console.log(`New chat group created between ${senderId} and ${receiverIds.join(', ')}`);
      } else {
        console.log(`Existing chat group found for ${senderId} and ${receiverIds.join(', ')}`);
      }
    }

    if (!chatGroup) {
      throw new Error("Chat group not found or could not be created");
    }

    let uploadedImageUrl;

    if (messageContent.imageUrl && messageContent.imageUrl.startsWith("data:image")) {
      uploadedImageUrl = await uploadImageToCloudinary(messageContent.imageUrl, "chat_images");
    }

    const newMessage = await messageModel.create({
      senderId,
      chatGroup: chatGroup._id,
      text: messageContent.text || null,
      imageUrl: uploadedImageUrl || messageContent.imageUrl || null,
      emoji: messageContent.emoji || null,
      productLink: messageContent.productLink || null,
    });

    chatGroup.lastMessage = newMessage._id;
    await chatGroup.save();

    const allMembers = chatGroup.members;
    allMembers.forEach((userId: string) => {
      const receiverSocketId = userSocketMap.get(userId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', {
          chatGroupId: chatGroup._id,
          message: newMessage,
        });
      }
    });


    console.log(`Message sent from ${senderId} to chat group ${chatGroup._id}`);
    return newMessage;

  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// export const getMessagesService = async (chatGroupId: string, userId: string) => {
//   try {
//     const chatGroup = await chatGroupModel.findById(chatGroupId).exec();
//     if (!chatGroup) {
//       throw new Error("Chat group not found");
//     }

//     const messages = await messageModel.find({ chatGroup: chatGroupId })
//       .sort({ createdAt: 1 })
//       .exec();

//     return messages;
//   } catch (error) {
//     throw new Error(`Error fetching messages: ${(error as Error).message}`);
//   }
// };

export const getMessagesService = async (
  chatGroupId: string,
  userId: string,
  page: number = 1,
  limit: number = 20
) => {
  try {
    const chatGroup = await chatGroupModel.findById(chatGroupId).exec();
    if (!chatGroup) {
      throw new Error("Chat group not found");
    }
    console.log(page, limit);

    const query: any = { chatGroup: chatGroupId };

    const totalMessages = await messageModel.countDocuments(query).exec();
    const totalPages = Math.ceil(totalMessages / limit);

    const skip = (page - 1) * limit;

    const messages = await messageModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      messages,
      page,
      limit,
      totalPages,
      totalMessages,
    };
  } catch (error) {
    throw new Error(`Error fetching messages: ${(error as Error).message}`);
  }
};


export const getChatGroupsService = async (userId: string) => {
  try {
    console.log(userId);

    const chatGroups = await chatGroupModel.find({ members: userId });

    const lastMessages = await Promise.all(
      chatGroups.map(async (group) => {
        const lastMessageInfo = await messageModel.findById(group.lastMessage);
        return lastMessageInfo;
      })
    );

    const resultData = chatGroups.map((group, index) => {
      return {
        ...group.toObject(),
        lastMessageInfo: lastMessages[index],
      };
    });

    return resultData;
  } catch (error) {
    throw new Error(`Error fetching chat groups: ${(error as Error).message}`);
  }
};

export const createChatGroupService = async (groupData: createGroupChat) => {
  try {
    if (!groupData.members || groupData.members.length < 2) {
      throw new Error("Group must have at least 2 members");
    }
    const existingGroup = await chatGroupModel.findOne({
      members: { $all: groupData.members },
      isPrivate: groupData.members.length === 2,
    }).exec();
    if (existingGroup) {
      throw new Error("Chat group already exists");
    }
    const chatGroup = new chatGroupModel(groupData);
    await chatGroup.save();
    return chatGroup;
  } catch (error) {
    throw new Error(`Error creating chat group: ${(error as Error).message}`);
  }
};

export const updateChatGroupAvatarService = async (chatGroupId: string, newImage: string) => {
  try {
    let chatGroup = await chatGroupModel.findById(chatGroupId).exec();
    if (!chatGroup) {
      throw new Error("Chat group not found");
    }

    const oldImagePublicId = chatGroup.avatarUrl
      ? extractPublicIdFromUrl(chatGroup.avatarUrl)
      : null;

    if (newImage && newImage !== chatGroup.avatarUrl) {
      if (oldImagePublicId) {
        deleteImageFromCloudinary(oldImagePublicId).catch((error) => {
          console.error("Failed to delete old image:", error);
        });
      }

      uploadImageToCloudinary(newImage, 'chat_group_avatars')
        .then((newAvatarUrl) => {
          return chatGroupModel.findByIdAndUpdate(
            chatGroupId,
            { avatarUrl: newAvatarUrl },
            { new: true }
          );
        })
        .then((updatedChatGroup) => {
          if (updatedChatGroup) {
            io.emit('chatGroupAvatarUpdated', {
              chatGroupId: chatGroupId,
              newAvatarUrl: updatedChatGroup.avatarUrl,
            });
          }
        })
        .catch((uploadError) => {
          console.error("Error uploading new avatar:", uploadError);
        });
    }

    return chatGroup;
  } catch (error) {
    throw new Error(`Error updating chat group avatar: ${(error as Error).message}`);
  }
};
