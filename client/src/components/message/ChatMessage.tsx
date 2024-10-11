import React, { useState, useMemo } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { AccountInfo } from '../../api/user';
import { MessageInfo } from '../../api/notification';
import { IoClose } from 'react-icons/io5';
import { useMessageContext } from '../../context/MessageContext';

interface ChatMessageProps {
  message: MessageInfo;
  sender?: AccountInfo;
  showDate: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender, showDate }) => {
  const { account } = useAuthContext();
  const isMe = message.senderId === account?._id;
  const formattedTime = new Date(message.createdAt).toLocaleTimeString();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { chatGroupSelect } = useMessageContext();

  const formattedDate = useMemo(() => {
    return new Date(message.createdAt).toLocaleDateString();
  }, [message.createdAt]);

  return (
    <>
      {showDate && (
        <div className="text-center my-4">
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
            {formattedDate}
          </span>
        </div>
      )}

      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} pt-4`}>
        {!isMe && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-purple-500">
              <img src={sender?.avatar} alt={sender?.name} className="w-full h-full rounded-full" />
            </div>
          </div>
        )}

        <div className={`max-w-xs mx-2 ${isMe ? 'text-right' : 'text-left'}`}>
          {!isMe && !chatGroupSelect?.isPrivate && (
            <p className="text-sm font-semibold mb-1">{sender?.name || 'Unknown User'}</p>
          )}
          <div className={`px-4 py-2 rounded-lg ${isMe ? 'bg-purple-500 text-white' : 'bg-gray-100 text-black'}`}>
            {message.text && <p>{message.text}</p>}
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="sent image"
                className="mt-2 max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsImageModalOpen(true)}
              />
            )}
            {message.emoji && <p className="text-2xl">{message.emoji}</p>}
            {message.productLink && (
              <a href={message.productLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                View Product
              </a>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{formattedTime}</p>
        </div>

        {isMe && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-purple-500">
              <img src={account.avatar} alt="You" className="w-full h-full rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {isImageModalOpen && message.imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setIsImageModalOpen(false);
              }}
            >
              <IoClose className="w-6 h-6" />
            </button>
            <img
              src={message.imageUrl}
              alt="enlarged image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessage;
