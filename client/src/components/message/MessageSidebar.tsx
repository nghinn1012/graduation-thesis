import React, { useEffect, useRef, useState } from "react";
import { useMessageContext } from "../../context/MessageContext";
import { FiSearch, FiUsers, FiUserPlus } from "react-icons/fi";
import { useSocket } from "../../hooks/useSocketContext";
import { AccountInfo } from "../../api/user";
import { useUserContext } from "../../context/UserContext";
import {
  ChatGroupInfo,
  MessageInfo,
  createChatGroup,
  notificationFetcher,
  EnhancedChatGroupInfo,
} from "../../api/notification";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useToastContext } from "../../hooks/useToastContext";
import CreateChatModal from "./CreateGroupChatModal";
import NewChatButtons from "./NewChatButtons";

interface ChatInfo {
  name: string;
  subtitle: string;
  isOnline: boolean;
}

const MessageSidebar: React.FC = () => {
  const { allUsers, loading, loadMoreUsers, hasMore } = useUserContext();
  const { chatGroups, setChatGroups, chatGroupSelect, setChatGroupSelect } =
    useMessageContext();
  const { onlineUsers } = useSocket();
  const { account, auth } = useAuthContext();
  const { error } = useToastContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateGroup, setIsCreateGroup] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNewChat = () => {
    setIsModalOpen(true);
    setIsCreateGroup(false);
  };

  const handleNewGroup = () => {
    setIsModalOpen(true);
    setIsCreateGroup(true);
  };

  const formatLastMessageTime = (createdAt: string): string => {
    const messageDate = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - messageDate.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    return messageDate.toLocaleDateString();
  };

  const getOtherUserInChat = (
    chatGroup: EnhancedChatGroupInfo
  ): AccountInfo | null => {
    if (!account || chatGroup?.members?.length > 2) return null;
    const otherUserId = chatGroup?.members?.find((id) => id !== account._id);
    if (!otherUserId) return null;
    return allUsers.find((user) => user._id === otherUserId) || null;
  };

  const renderLastMessage = (chatGroup: EnhancedChatGroupInfo) => {
    if (!chatGroup.lastMessage) return null;

    const sender = allUsers.find(
      (user) => user._id === chatGroup?.lastMessageInfo?.senderId
    );
    let content = "";

    if (chatGroup?.lastMessageInfo?.text) {
      content = chatGroup.lastMessageInfo.text;
    } else if (chatGroup?.lastMessageInfo?.imageUrl) {
      content = "📷 Image";
    } else if (chatGroup?.lastMessageInfo?.emoji) {
      content = chatGroup.lastMessageInfo.emoji;
    }

    const isSender = chatGroup?.lastMessageInfo?.senderId === account?._id;
    const senderName = isSender ? "You" : sender?.name || "Unknown";

    return {
      content: `${senderName}: ${content}`,
      time: formatLastMessageTime(chatGroup?.lastMessageInfo?.createdAt || ""),
    };
  };

  const getChatInfo = (chatGroup: EnhancedChatGroupInfo): ChatInfo => {
    const otherUser = getOtherUserInChat(chatGroup);

    if (otherUser) {
      return {
        name: otherUser.name,
        subtitle: chatGroup.isPrivate ? "Private Chat" : "Direct Message",
        isOnline: onlineUsers.includes(otherUser._id),
      };
    } else {
      const memberCount = chatGroup?.members?.length;
      return {
        name: chatGroup.groupName,
        subtitle: `${memberCount} member${memberCount !== 1 ? "s" : ""}`,
        isOnline: false,
      };
    }
  };

  const renderChatAvatar = (chatGroup: EnhancedChatGroupInfo) => {
    const otherUser = getOtherUserInChat(chatGroup);

    if (otherUser) {
      return otherUser.avatar ? (
        <img
          src={otherUser.avatar}
          alt={otherUser.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-xl text-white">
            {otherUser.name.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
        <FiUsers className="w-6 h-6 text-white" />
      </div>
    );
  };

  const handleCreateChat = async (chatData: createChatGroup) => {
    if (!auth?.token) return;
    try {
      const response = await notificationFetcher.createChatGroup(
        auth.token,
        chatData
      );
      if (!response) return;

      const newChat = response as unknown as EnhancedChatGroupInfo;
      setChatGroups([...chatGroups, newChat]);
      setChatGroupSelect(newChat);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create chat:", err);
      error("Failed to create chat", (err as Error).message);
    }
  };

  const handleChatClick = (chatGroup: EnhancedChatGroupInfo) => {
    setChatGroupSelect(chatGroup);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getFilteredChats = () => {
    return chatGroups.filter((chat) => {
      const otherUser = getOtherUserInChat(chat);
      if (otherUser) {
        return otherUser?.name
          ?.toLowerCase()
          .includes(searchTerm?.toLowerCase());
      }
      return chat?.groupName?.toLowerCase().includes(searchTerm?.toLowerCase());
    });
  };

  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: "20px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loading) {
        loadMoreUsers();
      }
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMoreUsers]);

  useEffect(() => {
    if (allUsers.length === 0) {
      loadMoreUsers();
    }
  }, [allUsers.length, loadMoreUsers]);

  const filteredChats = getFilteredChats();

  return (
    <div className="w-20 md:w-1/3 flex flex-col h-screen border-r border-gray-200 bg-white transition-all duration-300">
      {/* Desktop Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-2">Messages</h2>
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search conversations"
            className="w-full p-2 pl-8 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        <NewChatButtons
          onNewChat={handleNewChat}
          onNewGroup={handleNewGroup}
        />
      </div>

      {/* Chat List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
      >
        {filteredChats.map((chatGroup) => {
          const chatInfo = getChatInfo(chatGroup);
          const lastMessage = renderLastMessage(
            chatGroup as unknown as EnhancedChatGroupInfo
          );

          return (
            <div
              key={chatGroup._id}
              onClick={() => handleChatClick(chatGroup)}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                chatGroupSelect?._id === chatGroup._id ? "bg-blue-100" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                {renderChatAvatar(chatGroup)}
                {chatInfo.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="ml-3 flex-1 hidden md:block">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-900">
                    {chatInfo.name}
                  </h3>
                  {lastMessage && (
                    <span className="text-sm text-gray-500">
                      {lastMessage.time}
                    </span>
                  )}
                </div>
                {lastMessage ? (
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage.content}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 truncate">
                    {chatInfo.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Loader */}
        <div ref={loaderRef} className="p-4 text-center">
          {loading && (
            <div className="flex justify-center items-center space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Create Chat Modal */}
      <CreateChatModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsCreateGroup(false);
        }}
        onCreateChat={handleCreateChat}
        initialChatType={isCreateGroup ? "group" : "private"}
      />
    </div>
  );
};

export default MessageSidebar;
