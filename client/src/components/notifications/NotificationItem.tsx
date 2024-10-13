import React, { useState, useEffect } from 'react';
import { FaUser, FaHeart, FaComment, FaBookmark } from 'react-icons/fa';
import { AccountInfo } from '../../api/user';
import { useAuthContext } from '../../hooks/useAuthContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NotificationItemProps {
  notification: {
    _id: string;
    author: AccountInfo;
    post?: {
      _id: string;
      title: string;
      image: string;
    };
    type: string;
    message: string;
    read: boolean;
    createdAt?: string;
  };
  onClick: (postId: string, author: AccountInfo, notificationId: string, type: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  const { account } = useAuthContext();
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    if (notification.createdAt) {
      const date = new Date(notification.createdAt);
      const formatted = formatDistanceToNow(date, { addSuffix: true, locale: vi });
      setFormattedDate(formatted);
    } else {
      setFormattedDate("Unknown date");
    }
  }, [notification.createdAt]);

  const getIcon = () => {
    switch (notification.type) {
      case 'NEW_FOOD':
        return <FaUser className="w-5 h-5 text-blue-500" />;
      case 'FOOD_LIKED':
        return <FaHeart className="w-5 h-5 text-red-500" />;
      case 'FOOD_SAVED':
        return <FaBookmark className="w-5 h-5 text-red-500" />;
      default:
        return <FaComment className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div
      className={`py-3 px-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
      onClick={() =>
        onClick(
          notification?.post?._id || notification.author._id,
          notification.author,
          notification._id,
          notification.type
        )
      }
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 relative">
          <img
            className="w-10 h-10 rounded-full"
            src={notification.author.avatar || '/avatar-placeholder.png'}
            alt={`${notification.author.name}'s profile`}
          />
          {!notification.read && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm ${!notification.read ? 'font-semibold' : 'text-gray-900'}`}>
              <span className="font-semibold">{notification.author.name}</span>{' '}
              {`${notification.message}${notification?.post?.title ? `: ${notification.post.title}` : ''}`}
            </p>
            <div className="flex-shrink-0">{getIcon()}</div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
