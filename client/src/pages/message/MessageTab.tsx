import React, { useEffect, useState } from "react";
import MessageSidebar from "../../components/message/MessageSidebar";
import ChatHeader from "../../components/message/ChatHeader";
import MessageInput from "../../components/message/MessageInput";
import { useMessageContext } from "../../context/MessageContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import {
  createMessage,
  EnhancedChatGroupInfo,
  MessageInfo,
  notificationFetcher,
} from "../../api/notification";
import { useUserContext } from "../../context/UserContext";
import { AccountInfo } from "../../api/user";
import ChatContainer from "../../components/message/ChatContainer";
import { useI18nContext } from "../../hooks/useI18nContext";

interface MessageTabProps {}

const MessageTab: React.FC<MessageTabProps> = () => {
  const {
    chatMessages,
    setChatMessages,
    chatGroupSelect,
    chatGroups,
    getMessagesOfChatGroup,
    addMessage,
    setChatGroupSelect,
    setChatGroups,
  } = useMessageContext();
  const { auth, account } = useAuthContext();
  const { allUsers } = useUserContext();
  const languageContext = useI18nContext();
  const lang = languageContext.of("MessageSection");

  const [senders, setSenders] = useState<{ [key: string]: AccountInfo }>({});

  useEffect(() => {
    const sendersMap = chatMessages.reduce((acc, message) => {
      if (!acc[message.senderId]) {
        const sender = allUsers.find((user) => user._id === message.senderId);
        if (sender) {
          acc[message.senderId] = sender;
        }
      }
      return acc;
    }, {} as { [key: string]: AccountInfo });

    setSenders(sendersMap);
  }, [chatMessages, allUsers]);

  const handleSendMessage = async (newMessage: string, image?: string) => {
    if (!auth?.token || !chatGroupSelect || !account) return;

    const messageInfo: createMessage = {
      senderId: account._id || "",
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
      const response = await notificationFetcher.sendMessage(
        auth.token,
        messageInfo
      );
      const newMessageInfo = response as unknown as MessageInfo;

      const { text = "", imageUrl = "", emoji = "" } = newMessageInfo;

      addMessage(newMessageInfo);

      setChatGroups(
        chatGroups.map((chatGroup) => {
          if (chatGroup._id === chatGroupSelect._id) {
            return {
              ...chatGroup,
              lastMessage: newMessageInfo._id,
              lastMessageInfo: {
                _id: newMessageInfo._id,
                text,
                imageUrl,
                emoji,
                createdAt: newMessageInfo.createdAt,
                senderId: newMessageInfo.senderId,
              },
            };
          }
          return chatGroup;
        })
      );
    } catch (error) {
      console.error(lang("fail-send-message"), error);
    }
  };

  return (
    <div className="h-screen max-h-screen flex overflow-hidden">
      <MessageSidebar />

      <div className="flex-1 flex flex-col min-h-0">
        {chatGroupSelect ? (
          <>
            <ChatHeader/>
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto bg-gray-50">
                <ChatContainer
                  messages={chatMessages}
                  senders={senders}
                />
              </div>
              <div className="flex-shrink-0">
                <MessageInput onSendMessage={handleSendMessage} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                {lang("welcome")}
              </h2>
              <p className="text-gray-500">
                {lang("selectChat")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageTab;
