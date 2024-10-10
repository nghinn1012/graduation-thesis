
import React from 'react';
import { FaUser, FaHeart } from 'react-icons/fa';
import { AccountInfo } from '../../api/user';

interface NotificationItemProps {
  notification: {
    author: AccountInfo;
    postId: string;
    type: string;
  };
  onClick: (postId: string, author: AccountInfo) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  return (
    <div
      className="border-b border-gray-300 cursor-pointer hover:bg-gray-50"
      onClick={() => onClick(notification.postId, notification.author)}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full">
            <img
              src={notification.author.avatar || "/avatar-placeholder.png"}
              alt={`${notification.author.name}'s profile`}
            />
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            {notification.type === "follow" && (
              <FaUser className="w-5 h-5 text-primary" />
            )}
            {notification.type === "like" && (
              <FaHeart className="w-5 h-5 text-red-500" />
            )}
            <div className="flex gap-1">
              <span className="font-bold">{notification.author.name}</span>{" "}
              {notification.type === "follow"
                ? "followed you"
                : "liked your post"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
