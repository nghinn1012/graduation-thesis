import { Server, Socket } from "socket.io";
import { NotificationToUser } from "../data/interface/notification_interface";
import { userSocketMap } from ".";
import { HydratedDocument } from "mongoose";
import { io } from "../../index";

const SOCKET_EVENTS = {
  NEW_NOTIFICATION: "new-notification",
  READ_NOTIFICATION: "read-notification",
} as const;

export const sendNotification = async (
  userId: string,
  notification: NotificationToUser
) => {
  const userSocketId = userSocketMap.get(userId);
  if (userSocketId) {
    io.to(userSocketId).emit(SOCKET_EVENTS.NEW_NOTIFICATION, notification);
    console.log(`Notification sent to user ${userId} via socket`);
  } else {
    await storeNotificationForUser(userId, notification);
    console.log(`Notification stored for offline user ${userId}`);
  }
};

const storeNotificationForUser = async (userId: string, notification: NotificationToUser) => {
  console.log(`Storing notification for user ${userId} in the database`);
};

export const sendNotificationToUsers = async (
  users: string[],
  notification: NotificationToUser
) => {
  for (const userId of users) {
    await sendNotification(userId, notification);
  }
};

export const markNotificationAsRead = (socket: Socket, notificationId: string) => {
  socket.emit(SOCKET_EVENTS.READ_NOTIFICATION, notificationId);
};
