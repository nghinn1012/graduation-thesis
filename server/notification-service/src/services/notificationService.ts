import { NotificationType } from "../data/interface/notification_interface";
import NotificationModel from "../models/notiModel";
import { sendNotificationToUsers } from "../socket";

export const createLikedPostNotification = async (userId: string, postId: string, likerId: string) => {
  try {
    const message = `${likerId} liked your post`;
    const notification = new NotificationModel({
      userId: [userId],
      message,
      type: NotificationType.Like,
      link: `/posts/${postId}`,
    });
    await notification.save();
    return notification;
  } catch (error) {
    throw new Error(`Error creating like notification: ${(error as Error).message}`);
  }
}
