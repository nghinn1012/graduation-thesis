import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { useSocket } from "../hooks/useSocketContext";
import { notificationFetcher, NotificationInfo, NotificationLoad } from "../api/notification";
import { AccountInfo } from "../api/user";

interface Notification {
  _id: string;
  user: string;
  author: AccountInfo;
  post: {
    _id: string;
    title: string;
    image: string;
  };
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: NotificationInfo[];
  unreadNotifications: NotificationInfo[];
  markNotificationAsRead: (notificationId: string) => void;
  loading: boolean;
  unreadCount: number;
  markAllNotificationsAsRead: () => void;
  loadMoreNotifications: () => Promise<void>;
  hasMore: boolean;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { account, auth } = useAuthContext();
  const { socket } = useSocket();

  const unreadNotifications = useMemo(() => {
    return notifications.filter(notification => !notification.read);
  }, [notifications]);

  const fetchNotifications = useCallback(async (pageNumber: number) => {
    if (!account || !auth?.token) return;

    try {
      setLoading(true);
      const response = await notificationFetcher.getNotifications(auth.token, pageNumber) as unknown as NotificationLoad;
      if (!response) {
        throw new Error('Failed to fetch notifications');
      }

      console.log(response);
      const { notifications: newNotifications, hasMore: moreNotifications, unreadCount } = response;
      console.log(unreadCount);

      setNotifications((notifications) => [...notifications, ...newNotifications]);
      setHasMore(moreNotifications);
      setUnreadCount(unreadCount);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [account, auth?.token]);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!socket || !account) return;

    socket.on("new-notification", (data: NotificationInfo) => {
      console.log("New notification:", data);
      setNotifications((prevNotifications) => [data, ...prevNotifications]);
      setUnreadCount(prevCount => prevCount + 1);  // Increase unread count when a new notification arrives
    });

    return () => {
      if (socket) {
        socket.off("new-notification");
      }
    };
  }, [socket, account]);

  const markNotificationAsRead = async (notificationId: string) => {
    if (!account || !auth?.token
      || !notifications.find(notification => notification._id === notificationId && !notification.read)
    ) return;

    try {
      const response = await notificationFetcher.markNotificationAsRead(auth?.token, { notificationId: notificationId });

      if (!response) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!account || !auth?.token) return;

    try {
      const response = await notificationFetcher.markAllNotificationsAsRead(auth?.token);

      if (!response) {
        throw new Error('Failed to mark all notifications as read');
      }

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          ({ ...notification, read: true })
        )
      );
      setUnreadCount(0);  // Reset unread count to 0
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  const loadMoreNotifications = async () => {
    if (loading || !hasMore) return;
    await fetchNotifications(page + 1);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadNotifications,
      markNotificationAsRead,
      loading,
      unreadCount,  // Use API-provided unread count
      markAllNotificationsAsRead,
      loadMoreNotifications,
      hasMore
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }
  return context;
};
