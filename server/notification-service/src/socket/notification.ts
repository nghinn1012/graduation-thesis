import { Socket } from "socket.io";
import { NotificationToUser } from "../data/interface/notification_interface";

const socketNotificationEmitKey = {
  NEW_NOTIFICATION: "new-notification",
  READ_NOTIFICATION: "read-notification",
} as const;

export const sendNotification = (
  sockets: Socket[],
  notification: NotificationToUser
) => {
  sockets.forEach((socket) =>
    socket.emit(socketNotificationEmitKey.NEW_NOTIFICATION, notification)
  );
};
