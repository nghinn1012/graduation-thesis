import React from 'react';
import { useMessageContext } from '../../context/MessageContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useUserContext } from '../../context/UserContext';

const ChatHeader: React.FC = () => {
  const { chatGroupSelect, getUserIfPrivate } = useMessageContext();
  const { account } = useAuthContext();
  const { allUsers } = useUserContext();

  const userIfPrivate = chatGroupSelect && chatGroupSelect.isPrivate
    ? getUserIfPrivate(chatGroupSelect)
    : null;

  return (
    <div className="flex items-center border-b border-gray-300 p-2">
      {chatGroupSelect ? (
        <>
          {chatGroupSelect.isPrivate && userIfPrivate ? (
            <>
              <img
                src={userIfPrivate.avatar || 'default_user_icon.png'}
                alt={userIfPrivate.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-2">
                <p className="font-bold">{userIfPrivate.name}</p>
                <p className="text-sm">@{userIfPrivate.username}</p>
              </div>
            </>
          ) : (
            <>
              <img
                src={'default_group_icon.png'}
                alt={chatGroupSelect.groupName}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-2">
                <p className="font-bold">{chatGroupSelect.groupName}</p>
              </div>
            </>
          )}
        </>
      ) : (
        <p className="font-bold">Select a user to chat</p>
      )}
    </div>
  );
};

export default ChatHeader;
