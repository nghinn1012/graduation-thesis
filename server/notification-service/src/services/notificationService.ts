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
    message: `liked-your-post`,
    author: user._id,
    post: food,
  };
  const notification = new NotificationModel(notificationData);
  await notification.save();
  sendNotificationToUsers([authorId], {
    ...notificationData,
    _id: notification._id,
    createdAt: notification.createdAt,
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
    message: `created-a-new-food`,
    author: user._id,
    post: food,
  }
  const notification = new NotificationModel(notificationData);
  await notification.save();
  sendNotificationToUsers(followers, {
    ...notificationData,
    _id: notification._id,
    createdAt: notification.createdAt,
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
  const baseNotification: NotificationInfo = {
    users: [author],
    reads: [],
    type: "FOOD_COMMENTED",
    author: user._id,
    post: food,
    message: ""
  };

  if (mentions?.length) {
    const filteredMentions = mentions === author ? "" : mentions;

    if (filteredMentions.length) {
      const mentionNotification = new NotificationModel({
        ...baseNotification,
        users: filteredMentions,
        message: "mentioned-you-in-a-comment",
      });
      await mentionNotification.save();

      sendNotification(filteredMentions, {
        ...baseNotification,
        _id: mentionNotification._id,
        author: user,
        read: false,
        message: "mentioned-you-in-a-comment",
      });
    }
  }

  if (author !== user._id) {
    const commentNotification = new NotificationModel({
      ...baseNotification,
      message: "commented-on-your-post",
    });
    await commentNotification.save();

    sendNotification(author, {
      ...baseNotification,
      _id: commentNotification._id,
      createdAt: commentNotification.createdAt,
      author: user,
      read: false,
      message: "commented-on-your-post",
    });
  }
};

export const createSavedFoodNotifications = async (
  user: IAuthor,
  food: PostNotification,
  authorId: string
) => {
  const notificationData: NotificationInfo = {
    users: [authorId],
    reads: [],
    type: "FOOD_SAVED",
    author: user._id,
    message: `saved-your-post`,
    post: food,
  }
  const notification = new NotificationModel(notificationData);
  await notification.save();
  sendNotificationToUsers([authorId], {
    ...notificationData,
    _id: notification._id,
    createdAt: notification.createdAt,
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
    message: `made-your-food`,
    author: user._id,
    post: food,
  }
  const notification = new NotificationModel(notificationData);
  await notification.save();
  sendNotificationToUsers([authorId], {
    ...notificationData,
    _id: notification._id,
    createdAt: notification.createdAt,
    author: user,
    read: false,
  });
}

export const createFollowNotifications = async (
  user: string,
  follower: IAuthor
) => {
  const notificationData: NotificationInfo = {
    users: [user],
    reads: [],
    type: "NEW_FOLLOWER",
    author: follower._id,
    message: `started-following-you`,
  }
  const notification = new NotificationModel(notificationData)
  await notification.save();
  sendNotification(user, {
    ...notificationData,
    _id: notification._id,
    createdAt: notification.createdAt,
    author: follower,
    read: false,
  });
}

export const getNotificationsServices = async (
  userId: string,
  page: number,
  limit: number = 10
) => {
  try {
    const skip = (page - 1) * limit;

    const notifications = await NotificationModel.find({
      users: { $in: [userId] },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec() as NotificationInfo[];

    const totalCount = await NotificationModel.countDocuments({
      users: { $in: [userId] },
    });

    const totalUnread = await NotificationModel.countDocuments({
      users: { $in: [userId] },
      reads: { $nin: [userId] },
    });

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
        author: author,
        read: n.reads.includes(userId),
      };
      return cleanedNotification;
    });

    return {
      notifications: notificationsToUser,
      unreadCount: totalUnread,
      totalCount,
      hasMore: totalCount > skip + notifications.length,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }
    if (!notification.reads.includes(userId)) {
      notification.reads.push(userId);
      await notification.save();
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read");
  }
}

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notifications = await NotificationModel.find({
      users: { $in: [userId] },
      reads: { $nin: [userId] },
    });

    await Promise.all(
      notifications.map(async (notification: typeof NotificationModel) => {
        if (!notification.reads.includes(userId)) {
          notification.reads.push(userId);
          await notification.save();
        }
      })
    );

  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error("Failed to mark all notifications as read");
  }
};
