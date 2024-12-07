import React, {
  FC,
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoSettingsOutline } from "react-icons/io5";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useNotificationContext } from "../../context/NotificationContext";
import { usePostContext } from "../../context/PostContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import NotificationItem from "../../components/notifications/NotificationItem";
import { AccountInfo } from "../../api/user";
import { useI18nContext } from "../../hooks/useI18nContext";
import { useToastContext } from "../../hooks/useToastContext";

interface Notification {
  _id: string;
  author: AccountInfo;
  post: {
    _id: string;
    title: string;
  } | null;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const NotificationPage: FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    loadMoreNotifications,
    loading,
    hasMore,
  } = useNotificationContext();
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const locationPath = useLocation().pathname;
  const { fetchPost } = usePostContext();
  const { auth, account } = useAuthContext();
  const language = useI18nContext();
  const lang = language.of("NotificationSection");
  const { success, error } = useToastContext();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastNotificationRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreNotifications();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, loadMoreNotifications]
  );

  useEffect(() => {
    const notificationContainer = document.querySelector(".overflow-y-auto");
    if (notificationContainer) {
      notificationContainer.scrollTop = 0;
    }
  }, [activeTab]);

  const markAllAsRead = async (): Promise<void> => {
    if (window.confirm(lang("mark-read-confirm"))) {
      try {
        await markAllNotificationsAsRead();
        success(lang("mark-read-success"));
      } catch (err) {
        console.error("Error marking notifications as read:", err);
        error(lang("mark-read-failed", lang(err as string)));
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

    try {
      if (type === "SEND_REPORT" || type === "SEND_REPORT_UPDATE") {
        await markNotificationAsRead(notificationId);
        return;
      }
      if (type === "NEW_FOLLOWER" && author._id) {
        navigate(`/users/profile/${author._id}`);
      } else {
        setIsLoadingPost(true);
        const post = await fetchPost(postId);
        console.log(post);
        if (!post || post.isDeleted) {
          navigate("/not-found");
          console.error("Post not found");
        } else {
          navigate(`/posts/${postId}`, {
            state: { post, postAuthor: account?._id, locationPath },
          });
        }
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
      ? notifications?.filter((notification) => !notification.read)
      : notifications;
  }, [activeTab, notifications]);

  return (
    <div className="flex flex-col h-full max-w-full overflow-hidden">
      <div className="flex-shrink-0 w-full">
        <div className="flex justify-between items-center p-4">
          <p className="font-bold">{lang("notifications")}</p>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <IoSettingsOutline className="w-5 h-5" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={markAllAsRead}>{lang("mark-all-read")}</a>
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
            {lang("all")}
          </button>
          <button
            className={`tab w-full ${
              activeTab === "unread" ? "tab-active" : ""
            }`}
            role="tab"
            onClick={() => setActiveTab("unread")}
          >
            {lang("unread")}
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto border-b border-l border-r border-gray-300">
        {filteredNotifications.length === 0 ? (
          <div className="text-center p-4 font-bold">
            {lang("no-notifications")}
          </div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <div
              key={`${notification._id}-${index}`}
              ref={
                index === filteredNotifications.length - 1
                  ? lastNotificationRef
                  : null
              }
            >
              <NotificationItem
                notification={{
                  _id: notification._id,
                  author: notification.author as AccountInfo,
                  post: notification.post,
                  type: notification.type,
                  message: notification.message,
                  read: notification.read,
                  createdAt: notification.createdAt,
                }}
                onClick={handleNotificationClick}
              />
            </div>
          ))
        )}
        {loading && (
          <div className="text-center p-4">
            <LoadingSpinner size="md" />
          </div>
        )}
        {!loading && !hasMore && (
          <div className="text-center p-4">{lang("no-more-notifications")}</div>
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
