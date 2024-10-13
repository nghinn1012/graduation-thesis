import { IAuthor } from "../broker/rpc_consumer";
import { NotificationInfo, NotificationToUser, PostNotification } from "../data/interface/notification_interface";
import NotificationModel from "../models/notiModel";
import { sendNotification, sendNotificationToUsers } from "../socket/notification";
import { rpcGetUsers } from "./rpc.services";

export const createLikedFoodNotifications = async (
  user: IAuthor,
  food: PostNotification,
  authorId: string
) => {
  console.log(user, food, authorId);
  const notificationData: NotificationInfo = {
    users: [authorId],
    reads: [],
    type: "FOOD_LIKED",
    message: `liked your food`,
    author: user._id,
    post: food,
  };
  const notification = new NotificationModel(notificationData);
  await notification.save();
  sendNotificationToUsers([authorId], {
    ...notificationData,
    author: user,
    read: false,
  });
};

export const createNewFoodNotifications = async (
  user: IAuthor,
  food: PostNotification,
  followers: string[]
) => {
  const notificationData: NotificationInfo = {
    users: followers,
    reads: [],
    type: "NEW_FOOD",
    message: `created a new food`,
    author: user._id,
    post: food,
  }
  const notification = new NotificationModel(notificationData);
  await notification.save();
  sendNotificationToUsers(followers, {
    ...notificationData,
    author: user,
    read: false,
  });
}

export const createCommentedFoodNotifications = async (
  user: IAuthor,
  food: PostNotification,
  author: string,
  mentions: string
) => {
  const notificationData: NotificationInfo = {
    users: [author, ...(mentions || [])],
    reads: [],
    type: "FOOD_COMMENTED",
    message: `commented on your post`,
    author: user._id,
    post: food,
  }
  const notification = new NotificationModel(notificationData);
  await notification.save();
  console.log(mentions);
  sendNotification(mentions, {
    ...notificationData,
    author: user,
    read: false,
    message: `mentioned you in a comment`,
  });
  if (author !== user._id && !mentions?.includes(author)) {
    sendNotification(author, {
      ...notificationData,
      author: user,
      read: false,
      message: `commented on your post`,
    });
  }
}

export const createSavedFoodNotifications = async(
  user: IAuthor,
  food: PostNotification,
  authorId: string
) => {
  const notificationData: NotificationInfo = {
    users: [authorId],
    reads: [],
    type: "FOOD_SAVED",
    author: user._id,
    message: `saved your food`,
    post: food,
  }
  const notification = new NotificationModel(notificationData);
  await notification.save();
  sendNotificationToUsers([authorId], {
    ...notificationData,
    author: user,
    read: false,
  });
}

export const createMadeFoodNotifications = async (
  user: IAuthor,
  food: PostNotification,
  authorId: string
) => {
  console.log(user);
  const notificationData: NotificationInfo = {
    users: [authorId],
    reads: [],
    type: "FOOD_MADE",
    message: `made your food`,
    author: user._id,
    post: food,
  }
  const notification = new NotificationModel(notificationData);
  await notification.save();
  sendNotificationToUsers([authorId], {
    ...notificationData,
    author: user,
    read: false,
  });
}

export const createFollowNotifications = async(
  user: string,
  follower: IAuthor
) => {
  const notificationData: NotificationInfo = {
    users: [user],
    reads: [],
    type: "NEW_FOLLOWER",
    author: follower._id,
    message: `started following you`,
  }
  const notification = new NotificationModel(notificationData)
  await notification.save();
  sendNotification(user, {
    ...notificationData,
    author: follower,
    read: false,
  });
}

export const getNotificationsServices = async (userId: string) => {
  try {
    const notifications = await NotificationModel.find({
      users: { $in: [userId] },
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as NotificationInfo[];

    const authorIds = notifications.map((n) => n.author);
    const authors = await rpcGetUsers<IAuthor[]>(authorIds, ["_id", "name", "avatar"]);
    if (!authors) {
      throw new Error("Failed to fetch authors");
    }

    const notificationsToUser = notifications.map((n) => {
      const author = authors.find((a) => a._id.toString() === n.author.toString());
      if (!author) {
        throw new Error(`Author not found for notification ${n._id}`);
      }

      const cleanedNotification = {
        _id: n._id,
        message: n.message,
        type: n.type,
        post: n.post ? { _id: n.post._id, title: n.post.title } : null,
        createdAt: n.createdAt,
        author: author
      };

      return cleanedNotification;
    });

    return notificationsToUser;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
};
