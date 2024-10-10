import { Request, Response } from "express";
import { sendActiveMannualAccount } from "../services/mailService";
import { AuthRequest } from "../data";
import { getNotificationsServices } from "../services/notificationService";


export const hello = (_request: Request, response: Response): Response => {
  console.log("Hello");
  sendActiveMannualAccount({
    token: "123455",
    email: "ngo.thao.huong@sun-asterisk.com"
  })
  return response.send("Hello from Notification Service");
}

export const getAllNotificationsController = (_request: AuthRequest, response: Response) => {
  const userId = _request?.authContent?.data.userId;
  if (!userId) {
    return response.status(401).json({ message: "Unauthorized" });
  }
  try {
    getNotificationsServices(userId).then((notifications) => {
      return response.json(notifications);
    });
  } catch (error) {
    return response.status(500).json({
      message: "An unkown error occured"
    });
  }
}
