import React, { useEffect, useRef, useState } from "react";
import { useMessageContext } from "../../context/MessageContext";
import { FiSearch, FiUsers, FiUserPlus } from "react-icons/fi";
import { useSocket } from "../../hooks/useSocketContext";
import { AccountInfo } from "../../api/user";
import { useUserContext } from "../../context/UserContext";
import {
  ChatGroupInfo,
  createChatGroup,
  notificationFetcher,
} from "../../api/notification";
import { useAuthContext } from "../../hooks/useAuthContext";

import { useToastContext } from "../../hooks/useToastContext";
import CreateChatModal from "./CreateGroupChatModal";

const MessageSidebar: React.FC = () => {
  const { allUsers, loading, loadMoreUsers, hasMore } = useUserContext();
  const { chatGroups, setChatGroups, chatGroupSelect, setChatGroupSelect } =
    useMessageContext();
  const [searchTerm, setSearchTerm] = useState("");
  const loaderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onlineUsers } = useSocket();
  const { account, auth } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateGroup, setIsCreateGroup] = useState(false);
  const { error } = useToastContext();

  const getOtherUserInChat = (chatGroup: ChatGroupInfo): AccountInfo | null => {
    if (!account || chatGroup.members.length > 2) return null;
    const otherUserId = chatGroup.members.find((id) => id !== account._id);
    if (!otherUserId) return null;
    return allUsers.find((user) => user._id === otherUserId) || null;
  };

  const handleCreateChat = async (chatData: createChatGroup) => {
    if (!auth?.token) return;
    try {
      const response = await notificationFetcher.createChatGroup(
        auth.token,
        chatData
      );
      if (!response) return;

      const newChat = response as unknown as ChatGroupInfo;
      setChatGroups([...chatGroups, newChat]);
      setChatGroupSelect(newChat);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create chat:", err);
      error("Failed to create chat", (err as Error).message);
    }
  };

  const handleChatClick = (chatGroup: ChatGroupInfo) => {
    setChatGroupSelect(chatGroup);
  };

  const getFilteredChats = () => {
    return chatGroups.filter((chat) => {
      const otherUser = getOtherUserInChat(chat);
      if (otherUser) {
        return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        return chat.groupName.toLowerCase().includes(searchTerm.toLowerCase());
      }
    });
  };

  const renderChatAvatar = (chatGroup: ChatGroupInfo) => {
    const otherUser = getOtherUserInChat(chatGroup);

    if (otherUser) {
      if (otherUser.avatar) {
        return (
          <img
            src={otherUser.avatar}
            alt={otherUser.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        );
      } else {
        return (
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xl text-white">
              {otherUser.name.charAt(0).toUpperCase()}
            </span>
          </div>
        );
      }
    } else {
      return (
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
          <FiUsers className="w-6 h-6 text-white" />
        </div>
      );
    }
  };

  const renderChatInfo = (chatGroup: ChatGroupInfo) => {
    const otherUser = getOtherUserInChat(chatGroup);

    if (otherUser) {
      return {
        name: otherUser.name,
        subtitle: chatGroup.isPrivate ? "Private Chat" : "Direct Message",
        isOnline: onlineUsers.includes(otherUser._id),
      };
    } else {
      const memberCount = chatGroup.members.length;
      return {
        name: chatGroup.groupName,
        subtitle: `${memberCount} member${memberCount !== 1 ? "s" : ""}`,
        isOnline: false,
      };
    }
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
  }, []);

  const filteredChats = getFilteredChats();

  return (
    <div className="w-20 md:w-1/3 flex flex-col h-screen border-r border-gray-200 bg-white transition-all duration-300">
      {/* Header */}
      <div className="hidden md:block p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-2">Messages</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations"
            className="w-full p-2 pl-8 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <FiSearch className="w-5 h-5 text-gray-400" />
          </span>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            className="btn btn-ghost flex-1 justify-start normal-case"
            onClick={() => setIsModalOpen(true)}
          >
            <FiUserPlus className="w-5 h-5 mr-2" />
            New Chat
          </button>
          <button
            className="btn btn-ghost flex-1 justify-start normal-case"
            onClick={() => {
              setIsModalOpen(true);
              setIsCreateGroup(true);
            }}
          >
            <FiUsers className="w-5 h-5 mr-2" />
            New Group
          </button>
        </div>
      </div>

      {/* Mobile Search Icon */}
      <div className="md:hidden p-4 flex justify-between items-center border-b border-gray-200">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <FiSearch className="w-6 h-6 text-gray-600" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 rounded-full"
          onClick={() => setIsModalOpen(true)}
        >
          <FiUserPlus className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Chat List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
      >
        {filteredChats.map((chatGroup) => {
          const chatInfo = renderChatInfo(chatGroup);

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
                  {/* <span className="text-sm text-gray-500">12m</span> */}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {chatInfo.subtitle}
                </p>
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

      <CreateChatModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsCreateGroup(false); // Reset the state when closing the modal
        }}
        onCreateChat={handleCreateChat}
        initialChatType={isCreateGroup ? "group" : "private"}
      />
    </div>
  );
};

export default MessageSidebar;
