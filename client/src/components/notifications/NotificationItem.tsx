import React from 'react';
import { FaUser, FaHeart, FaComment } from 'react-icons/fa';
import { AccountInfo } from '../../api/user';

interface NotificationItemProps {
  notification: {
    author: AccountInfo;
    post: {
      _id: string;
      title: string;
      image: string
    };
    type: string;
  };
  onClick: (postId: string, author: AccountInfo) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'NEW_FOOD':
        return <FaUser className="w-5 h-5 text-blue-500" />;
      case 'FOOD_LIKED':
        return <FaHeart className="w-5 h-5 text-red-500" />;
      default:
        return <FaComment className="w-5 h-5 text-green-500" />;
    }
  };

  const getActionText = () => {
    switch (notification.type) {
      case 'NEW_FOOD':
        return 'created a new post';
      case 'FOOD_LIKED':
        return 'liked your post';
      default:
        return 'đã bình luận về bài viết của bạn';
    }
  };

  return (
    <div
      className="py-3 px-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
      onClick={() => onClick(notification.post._id, notification.author)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <img
            className="w-10 h-10 rounded-full"
            src={notification.author.avatar || "/avatar-placeholder.png"}
            alt={`${notification.author.name}'s profile`}
          />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-900">
              <span className="font-semibold">{notification.author.name}</span>{' '}
              {getActionText()}
            </p>
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">2 ngày trước</p>
          <div className="mt-2 flex items-center space-x-2">
            <p className="text-sm text-gray-700 font-medium">{notification?.post?.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
