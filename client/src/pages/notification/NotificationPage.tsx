import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { IoSettingsOutline } from "react-icons/io5";
import { FC, useState } from "react";
import { useNotificationContext } from "../../context/NotificationContext";
import { AccountInfo } from "../../api/user";
import { usePostContext } from "../../context/PostContext";
import NotificationItem from "../../components/notifications/NotificationItem";

const NotificationPage: FC = () => {
  const { notifications } = useNotificationContext();
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  const locationPath = useLocation().pathname;
  const { fetchPost } = usePostContext();

  // Function to delete all notifications
  const deleteNotifications = (): void => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      alert("All notifications deleted");
    }
  };

  // Function to handle notification click
  const handleNotificationClick = async (postId: string, author: AccountInfo) => {
    if (!postId || !author) return;

    try {
      setIsLoadingPost(true);
      const post = await fetchPost(postId);
      navigate(`/posts/${author._id}`, {
        state: { post, postAuthor: author, locationPath },
      });
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setIsLoadingPost(false);
    }
  };

  const filteredNotifications =
    activeTab === "mentions"
      ? notifications.filter((notification) => notification.type === "mention")
      : activeTab === "recommendations"
      ? notifications.filter((notification) => notification.type === "recommendation")
      : notifications;

  return (
    <div className="flex-1 border-l border-r border-gray-300 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center p-4 border-b border-gray-300">
        <p className="font-bold">Notifications</p>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="m-1">
            <IoSettingsOutline className="w-4" />
          </div>
          <ul className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52">
            <li>
              <a onClick={deleteNotifications}>Delete all notifications</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Tabs for filtering notifications */}
      <div className="tabs tabs-boxed" role="tablist">
        <button
          className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
          role="tab"
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={`tab ${activeTab === "unreads" ? "tab-active" : ""}`}
          role="tab"
          onClick={() => setActiveTab("unreads")}
        >
          Unreads
        </button>
      </div>

      {/* Loading States */}
      {isLoadingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* No Notifications Message */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center p-4 font-bold">No notifications 🤔</div>
      ) : (
        filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={{
              author: notification.author,
              post: notification.post,
              type: notification.type,
              message: notification.message,
            }}
            onClick={handleNotificationClick}
          />
        ))
      )}
    </div>
  );
};

export default NotificationPage;
