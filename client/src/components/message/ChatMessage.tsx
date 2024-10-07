import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { AccountInfo } from '../../api/user';
import { useUserContext } from '../../context/UserContext';
import { MessageInfo } from '../../api/notification';
import { useMessageContext } from '../../context/MessageContext';

interface ChatMessageProps {
  message: MessageInfo;
  sender?: AccountInfo;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sender }) => {
  const { account } = useAuthContext();
  const isMe = message.senderId === account?._id;
  const formattedTime = new Date(message.createdAt).toLocaleTimeString();

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isMe && (
        <div className="w-10 h-10 rounded-full bg-purple-500 flex-shrink-0">
          <img src={sender?.avatar} alt={sender?.name} className="w-full h-full rounded-full" />
        </div>
      )}

      <div className={`max-w-xs mx-2 ${isMe ? 'text-right' : 'text-left'}`}>
        <div className={`px-4 py-2 rounded-lg ${isMe ? 'bg-purple-500 text-white' : 'bg-gray-100 text-black'}`}>
          {message.text && <p>{message.text}</p>}
          {message.imageUrl && <img src={message.imageUrl} alt="sent image" className="mt-2 max-w-full rounded-lg" />}
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
        <div className="w-10 h-10 rounded-full bg-purple-500 flex-shrink-0">
          <img src={account.avatar} alt="You" className="w-full h-full rounded-full" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
