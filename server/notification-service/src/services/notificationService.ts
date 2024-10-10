import { IAuthor } from "../broker/rpc_consumer";
import { NotificationInfo } from "../data/interface/notification_interface";
import NotificationModel from "../models/notiModel";
import { sendNotificationToUsers } from "../socket/notification";

export const createLikedFoodNotifications = async (
  user: IAuthor,
  foodId: string,
  authorId: string
) => {
  console.log(user, foodId, authorId);
  const notificationData: NotificationInfo = {
    users: [authorId],
    reads: [],
    type: "FOOD_LIKED",
    message: `Your food has been liked`,
    author: user,
    postId: foodId,
  };
  const notification = new NotificationModel(notificationData);
  await notification.save();
  sendNotificationToUsers([authorId], {
    ...notificationData,
    author: user,
    read: false,
  });
};

export const getNotificationsServices = async (userId: string) => {
  try {
    const notifications = await NotificationModel.find({
      users: { $in: [userId] },
    })
      .sort({ createdAt: -1 });

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
};
