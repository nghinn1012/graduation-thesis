import React, { useEffect } from "react";
import MessageSidebar from "../../components/message/MessageSidebar";
import ChatHeader from "../../components/message/ChatHeader";
import ChatMessage from "../../components/message/ChatMessage";
import MessageInput from "../../components/message/MessageInput";
import { useMessageContext } from "../../context/MessageContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import {
  createMessage,
  MessageInfo,
  notificationFetcher,
} from "../../api/notification";
import { useUserContext } from "../../context/UserContext";
import { AccountInfo } from "../../api/user";

interface MessageTabProps {}

const MessageTab: React.FC<MessageTabProps> = () => {
  const {
    chatMessages,
    setChatMessages,
    chatGroupSelect,
    getMessagesOfChatGroup,
  } = useMessageContext();
  const { auth, account } = useAuthContext();
  const { allUsers } = useUserContext();

  const handleSendMessage = (newMessage: string, image?: string) => {
    if (!auth?.token) return;
    const messageInfo: createMessage = {
      senderId: account?._id || "",
      receiverId: chatGroupSelect?.members || [],
      chatGroupId: chatGroupSelect?._id || "",
      messageContent: {
        text: newMessage,
        imageUrl: image || "",
        emoji: "",
        productLink: "",
      },
    };
    console.log(messageInfo);
    const response = notificationFetcher.sendMessage(auth?.token, messageInfo);
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <MessageSidebar />

      {/* Chat window */}
      <div className="flex-1 flex flex-col p-4">
        {/* Chat Header */}
        <ChatHeader />

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {chatMessages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg}
              sender={
                msg.senderId === account?._id
                  ? (account as unknown as AccountInfo)
                  : (allUsers.find(
                      (user) => user._id === msg.senderId
                    ) as unknown as AccountInfo)
              }
            />
          ))}
        </div>

        {/* Message input */}
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default MessageTab;
