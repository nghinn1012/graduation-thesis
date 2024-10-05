import { Request, Response } from 'express';
import { sendMessageService } from '../services/messageService';
import { AuthRequest } from '../data';
export const sendMessageController = async (req: AuthRequest, res: Response) => {
  const senderId = req?.authContent?.data.userId;
  const { receiverId, messageContent } = req.body;
  console.log(senderId, receiverId, messageContent);
  if (!receiverId || !messageContent || !senderId) {
    res.status(400).json({ message: 'ReceiverId and message are required' });
    return;
  }
  const result = await sendMessageService(senderId, receiverId, messageContent);
  res.json(result);
}
