import { io } from "../..";
import { createGroupChat } from "../data/interface/message_interface";
import chatGroupModel from "../models/chatGroupModel";
import messageModel from "../models/messageModel";
import { userSocketMap } from "../socket";
import { deleteImageFromCloudinary, extractPublicIdFromUrl, uploadImageToCloudinary } from "./imagesuploader.services";

export const sendMessageService = async (
  senderId: string,
  receiverId: string | string[],
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
      readBy: [
        senderId,
      ],
      unreadCount: receiverIds.length - 1,
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
    const chatGroups = await chatGroupModel.aggregate([
      {
        $match: {
          members: userId
        }
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'lastMessage',
          foreignField: '_id',
          as: 'lastMessageInfo'
        }
      },
      {
        $lookup: {
          from: 'messages',
          let: { groupId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$chatGroup', '$$groupId'] },
                readBy: { $nin: [userId] }
              }
            },
            {
              $count: 'unreadCount'
            }
          ],
          as: 'unreadMessages'
        }
      },
      {
        $project: {
          _id: 1,
          groupName: 1,
          members: 1,
          avatar: 1,
          createdAt: 1,
          updatedAt: 1,
          isPrivate: 1,
          lastMessage: 1,
          lastMessageInfo: { $arrayElemAt: ['$lastMessageInfo', 0] },
          unreadCount: {
            $cond: {
              if: { $size: '$unreadMessages' },
              then: { $arrayElemAt: ['$unreadMessages.unreadCount', 0] },
              else: 0
            }
          }
        }
      },
      {
        $sort: {
          'lastMessageInfo.createdAt': -1
        }
      }
    ]);

    return chatGroups;
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

export const renameChatGroupService = async (chatGroupId: string, newName: string) => {
  try {
    let chatGroup = await chatGroupModel.findByIdAndUpdate(
      chatGroupId,
      { groupName: newName },
      { new: true }
    ).exec();
    return chatGroup;
  } catch (error) {
    throw new Error(`Error renaming chat group: ${(error as Error).message}`);
  }
};

export const markMessageAsReadService = async (messageId: string, userId: string) => {
  try {
    const message = await messageModel.findByIdAndUpdate(
      messageId,
      {
        $addToSet: { readBy: userId }
      },
      {
        new: true,
        runValidators: true
      }
    ).exec();

    if (!message) {
      throw new Error('Message not found');
    }

    return message;
  } catch (error) {
    throw new Error(`Error marking message as read: ${(error as Error).message}`);
  }
};

export const markAllMessagesAsReadInGroupService = async (groupId: string, userId: string) => {
  try {
    const result = await messageModel.updateMany(
      {
        chatGroup: groupId,
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      },
      {
        runValidators: true
      }
    ).exec();

    return result;
  } catch (error) {
    throw new Error(`Error marking all messages as read in group: ${(error as Error).message}`);
  }
};
