import React, { FC, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoSettingsOutline } from "react-icons/io5";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useNotificationContext } from "../../context/NotificationContext";
import { usePostContext } from "../../context/PostContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import NotificationItem from "../../components/notifications/NotificationItem";
import { AccountInfo } from "../../api/user";

const NotificationPage: FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useNotificationContext();
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const locationPath = useLocation().pathname;
  const { fetchPost } = usePostContext();
  const { auth } = useAuthContext();

  const markAllAsRead = async (): Promise<void> => {
    if (window.confirm("Are you sure you want to mark all notifications as read?")) {
      try {
        await markAllNotificationsAsRead(); 
        alert("All notifications marked as read");
      } catch (error) {
        console.error("Error marking notifications as read:", error);
        alert("Failed to mark all notifications as read");
      }
    }
  };

  const handleNotificationClick = async (
    postId: string,
    author: AccountInfo,
    notificationId: string,
    type: string
  ) => {
    if (!author || !auth?.token) return;
    console.log("Notification clicked:", postId, author, notificationId);

    try {
      if (type === "NEW_FOLLOWER" && author._id) {
        navigate(`/users/profile/${author._id}`);
      } else {
        setIsLoadingPost(true);
        const post = await fetchPost(postId);
        navigate(`/posts/${author._id}`, {
          state: { post, postAuthor: author, locationPath },
        });
      }
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setIsLoadingPost(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    return activeTab === "unread"
      ? notifications.filter((notification) => !notification.read)
      : notifications;
  }, [activeTab, notifications]);

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden ">
      <div className="flex-shrink-0 w-full">
        <div className="flex justify-between items-center p-4">
          <p className="font-bold">Notifications</p>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <IoSettingsOutline className="w-5 h-5" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={markAllAsRead}>Mark all as read</a>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="tabs tabs-boxed w-full flex justify-center"
          role="tablist"
        >
          <button
            className={`tab w-full ${activeTab === "all" ? "tab-active" : ""}`}
            role="tab"
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            className={`tab w-full ${
              activeTab === "unread" ? "tab-active" : ""
            }`}
            role="tab"
            onClick={() => setActiveTab("unread")}
          >
            Unread
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto border-b border-l border-r border-gray-300">
        {filteredNotifications.length === 0 ? (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={{
                _id: notification._id,
                author: notification.author,
                post: notification.post,
                type: notification.type,
                message: notification.message,
                read: notification.read,
                createdAt: notification.createdAt,
              }}
              onClick={handleNotificationClick}
            />
          ))
        )}
      </div>

      {isLoadingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
