import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { SocketContext } from "./SocketContext";
import { useSocket } from "../hooks/useSocketContext";
import { notificationFetcher } from "../api/notification";
import { AccountInfo } from "../api/user";

interface Notification {
  id: string;
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
  notifications: Notification[];
  markNotificationAsRead: (notificationId: string) => void;
  loading: boolean;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { account, auth } = useAuthContext();
  const { socket } = useSocket();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!account || !auth?.token) return;

      try {
        const response = await notificationFetcher.getNotifications(auth.token);
        if (!response) {
          throw new Error('Failed to fetch notifications');
        }
        setNotifications(response as unknown as Notification[]);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [account]);

  useEffect(() => {
    if (!socket || !account) return;

    socket.on("new-notification", (data: Notification) => {
      console.log("New notification:", data);
      setNotifications((prevNotifications) => [data, ...prevNotifications]);
    });

    return () => {
      if (socket) {
        socket.off("new-notification");
      }
    };
  }, [socket, account]);

  const markNotificationAsRead = async (notificationId: string) => {
    if (!account) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}/mark-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, markNotificationAsRead, loading }}>
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
