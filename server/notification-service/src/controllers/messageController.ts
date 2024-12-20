import { Request, Response } from "express";
import {
  createChatGroupService,
  getChatGroupsService,
  getMessagesService,
  markMessageAsReadService,
  markAllMessagesAsReadInGroupService,
  renameChatGroupService,
  sendMessageService,
  updateChatGroupAvatarService,
} from "../services/messageService";
import { AuthRequest } from "../data";

export const sendMessageController = async (
  req: AuthRequest,
  res: Response
) => {
  const senderId = req?.authContent?.data.userId;
  const { receiverId, messageContent, chatGroupId } = req.body;
  console.log(senderId, receiverId, messageContent, chatGroupId);
  if (!receiverId || !messageContent || !senderId) {
    res.status(400).json({ message: "ReceiverId and message are required" });
    return;
  }
  const result = await sendMessageService(
    senderId,
    receiverId,
    messageContent,
    chatGroupId
  );
  res.json(result);
};

// export const getMessagesController = async (req: AuthRequest, res: Response) => {
//   const userId = req?.authContent?.data.userId;
//   const { chatGroupId } = req.params;
//   console.log(userId, chatGroupId);
//   if (!chatGroupId || !userId) {
//     res.status(400).json({ message: 'ChatGroupId is required' });
//     return;
//   }
//   const messages = await getMessagesService(chatGroupId, userId);
//   res.json(messages);
// }

export const getMessagesController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req?.authContent?.data?.userId;
    const { chatGroupId } = req.params;

    if (!chatGroupId || !userId) {
      return res.status(400).json({
        success: false,
        message: "ChatGroupId and userId are required",
      });
    }
    console.log(req.query);
    const page = parseInt(req.query.page as string, 10);
    const limit = parseInt(req.query.limit as string, 10);

    if (page <= 0 || limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive numbers",
      });
    }

    const messages = await getMessagesService(chatGroupId, userId, page, limit);

    return res.json({
      success: true,
      data: messages,
      message: "Messages fetched successfully",
    });
  } catch (error) {
    console.error("Error in getMessagesController:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching messages",
      error: (error as Error).message,
    });
  }
};

export const getChatGroupsController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req?.authContent?.data.userId;
  if (!userId) {
    res.status(400).json({ message: "UserId is required" });
    return;
  }
  try {
    const chatGroups = await getChatGroupsService(userId);
    res.json(chatGroups);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const createChatGroupController = async (
  req: AuthRequest,
  res: Response
) => {
  const groupData = req.body;
  const userId = req?.authContent?.data.userId;
  if (!groupData || !userId) {
    res.status(400).json({ message: "Group data is required" });
    return;
  }
  try {
    const chatGroup = await createChatGroupService(groupData);
    res.json(chatGroup);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateChatGroupAvatarController = async (
  req: AuthRequest,
  res: Response
) => {
  const { chatGroupId, avatarUrl } = req.body;
  if (!chatGroupId || !avatarUrl) {
    res.status(400).json({ message: "ChatGroupId and avatarUrl are required" });
    return;
  }
  try {
    const chatGroup = await updateChatGroupAvatarService(
      chatGroupId,
      avatarUrl
    );
    res.json(chatGroup);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const renameChatGroupController = async (
  req: AuthRequest,
  res: Response
) => {
  const { chatGroupId, groupName } = req.body;
  if (!chatGroupId || !groupName) {
    res.status(400).json({ message: "ChatGroupId and groupName are required" });
    return;
  }
  try {
    const chatGroup = await renameChatGroupService(
      chatGroupId,
      groupName
    );
    res.json(chatGroup);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const markMessageReadController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req?.authContent?.data.userId;
  const { messageId } = req.body;
  if (!messageId || !userId) {
    res.status(400).json({ message: "MessageId is required" });
    return;
  }
  try {
    const result = await markMessageAsReadService(messageId, userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export const markAllMessagesReadInGroupController = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req?.authContent?.data.userId;
  const { chatGroupId } = req.body;
  if (!chatGroupId || !userId) {
    res.status(400).json({ message: "GroupId is required" });
    return;
  }
  console.log(chatGroupId, userId);
  try {
    const result = await markAllMessagesAsReadInGroupService(chatGroupId, userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}
