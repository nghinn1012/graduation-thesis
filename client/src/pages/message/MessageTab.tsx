import React, { useEffect, useState } from "react";
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
import ChatContainer from "../../components/message/ChatContainer";

interface MessageTabProps {}

const MessageTab: React.FC<MessageTabProps> = () => {
  const {
    chatMessages,
    setChatMessages,
    chatGroupSelect,
    getMessagesOfChatGroup,
    addMessage,
  } = useMessageContext();
  const { auth, account } = useAuthContext();
  const { allUsers } = useUserContext();

  const [senders, setSenders] = useState<{ [key: string]: AccountInfo }>({});

  useEffect(() => {
    const sendersMap = chatMessages.reduce((acc, message) => {
      if (!acc[message.senderId]) {
        const sender = allUsers.find(user => user._id === message.senderId);
        if (sender) {
          acc[message.senderId] = sender;
        }
      }
      return acc;
    }, {} as { [key: string]: AccountInfo });

    setSenders(sendersMap);
  }, [chatMessages, allUsers]);

  const handleSendMessage = async (newMessage: string, image?: string) => {
    if (!auth?.token || !chatGroupSelect) return;
    const messageInfo: createMessage = {
      senderId: account?._id || "",
      receiverId: chatGroupSelect.members || [],
      chatGroupId: chatGroupSelect._id || "",
      messageContent: {
        text: newMessage,
        imageUrl: image || "",
        emoji: "",
        productLink: "",
      },
    };

    try {
      const response = await notificationFetcher.sendMessage(auth.token, messageInfo);
      addMessage(response as unknown as MessageInfo);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <MessageSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {chatGroupSelect ? (
          <>
            <ChatHeader />
            <div className="flex-1 overflow-y-auto bg-gray-50">
              <div className="h-full p-4">
                <ChatContainer messages={chatMessages} senders={senders} />
              </div>
            </div>
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Welcome to Messages
              </h2>
              <p className="text-gray-500">
                Select a chat from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageTab;
