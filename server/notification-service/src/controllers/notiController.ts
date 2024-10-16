import { Request, Response } from "express";
import { sendActiveMannualAccount } from "../services/mailService";
import { AuthRequest } from "../data";
import { getNotificationsServices, markAllNotificationsAsRead, markNotificationAsRead } from "../services/notificationService";


export const hello = (_request: Request, response: Response): Response => {
  console.log("Hello");
  sendActiveMannualAccount({
    token: "123455",
    email: "ngo.thao.huong@sun-asterisk.com"
  })
  return response.send("Hello from Notification Service");
}

export const getAllNotificationsController = async (request: AuthRequest, response: Response) => {
  const userId = request?.authContent?.data.userId;
  if (!userId) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  try {
    const page = parseInt(request.query.page as string) || 1;
    const limit = parseInt(request.query.limit as string) || 20;
    console.log("Page:", page, "Limit:", limit);

    if (page < 1 || limit < 1 || limit > 100) {
      return response.status(400).json({ message: "Invalid page or limit value" });
    }

    const result = await getNotificationsServices(userId, page, limit);
    return response.json(result);
  } catch (error) {
    console.error("Error in getAllNotificationsController:", error);
    return response.status(500).json({
      message: "An unknown error occurred"
    });
  }
};

export const markNotificationAsReadController = (_request: AuthRequest, response: Response) => {
  const userId = _request?.authContent?.data.userId;
  const notificationId = _request.params.notificationId;
  if (!userId) {
    return response.status(401).json({ message: "Unauthorized" });
  }
  try {
    markNotificationAsRead(notificationId, userId).then(() => {
      return response.json({ message: "Notification marked as read" });
    });
  } catch (error) {
    return response.status(500).json({
      message: "An unkown error occured"
    });
  }
}

export const markAllNotificationsAsReadController = (_request: AuthRequest, response: Response) => {
  const userId = _request?.authContent?.data.userId;
  if (!userId) {
    return response.status(401).json({ message: "Unauthorized" });
  }
  try {
    markAllNotificationsAsRead(userId).then(() => {
      return response.json({ message: "All notifications marked as read" });
    });
  } catch (error) {
    return response.status(500).json({
      message: "An unkown error occured"
    });
  }
}
