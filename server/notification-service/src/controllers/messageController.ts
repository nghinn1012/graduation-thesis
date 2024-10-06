import { Request, Response } from 'express';
import { createChatGroupService, getChatGroupsService, getMessagesService, sendMessageService } from '../services/messageService';
import { AuthRequest } from '../data';

export const sendMessageController = async (req: AuthRequest, res: Response) => {
  const senderId = req?.authContent?.data.userId;
  const { receiverId, messageContent, chatGroupId } = req.body;
  console.log(senderId, receiverId, messageContent, chatGroupId);
  if (!receiverId || !messageContent || !senderId) {
    res.status(400).json({ message: 'ReceiverId and message are required' });
    return;
  }
  const result = await sendMessageService(senderId, receiverId, messageContent, chatGroupId);
  res.json(result);
}

export const getMessagesController = async (req: AuthRequest, res: Response) => {
  const userId = req?.authContent?.data.userId;
  const { chatGroupId } = req.params;
  console.log(userId, chatGroupId);
  if (!chatGroupId || !userId) {
    res.status(400).json({ message: 'ChatGroupId is required' });
    return;
  }
  const messages = await getMessagesService(chatGroupId, userId);
  res.json(messages);
}

export const getChatGroupsController = async (req: AuthRequest, res: Response) => {
  const userId = req?.authContent?.data.userId;
  if (!userId) {
    res.status(400).json({ message: 'UserId is required' });
    return;
  }
  const chatGroups = await getChatGroupsService(userId);
  res.json(chatGroups);
}

export const createChatGroupController = async (req: AuthRequest, res: Response) => {
  const groupData = req.body;
  const userId = req?.authContent?.data.userId;
  if (!groupData || !userId) {
    res.status(400).json({ message: 'Group data is required' });
    return;
  }
  try {
    const chatGroup = await createChatGroupService(groupData);
    res.json(chatGroup);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}
