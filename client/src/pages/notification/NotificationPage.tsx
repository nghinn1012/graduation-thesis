import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser, FaHeart } from "react-icons/fa6";
import { FC, useContext, useState } from "react";
import { useNotificationContext } from "../../context/NotificationContext";
import { AccountInfo } from "../../api/user";
import { usePostContext } from "../../context/PostContext";
import NotificationItem from "../../components/notifications/NotificationItem";

const NotificationPage: FC = () => {
  const { notifications } = useNotificationContext();
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const navigate = useNavigate();
  const locationPath = useLocation().pathname;
  const { fetchPost } = usePostContext();

  const deleteNotifications = (): void => {
    alert("All notifications deleted");
  };

  const handleNotificationClick = async (postId: string, author: AccountInfo) => {
    console.log("Notification clicked", postId, author);
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

  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-300 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center p-4 border-b border-gray-300">
        <p className="font-bold">Notifications</p>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="m-1">
            <IoSettingsOutline className="w-4" />
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a onClick={deleteNotifications}>Delete all notifications</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Loading States */}
      {isLoadingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* No Notifications Message */}
      {notifications?.length === 0 && (
        <div className="text-center p-4 font-bold">No notifications 🤔</div>
      )}

      {/* Notifications List */}
      {notifications?.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={{
            author: notification.author,
            postId: notification.postId,
            type: notification.type,
          }}
          onClick={handleNotificationClick}
        />
      ))}
    </div>
  );
};

export default NotificationPage;
