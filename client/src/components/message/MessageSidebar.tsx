import React, { useEffect, useRef, useState } from "react";
import { useMessageContext } from "../../context/MessageContext";
import { FiSearch, FiUsers } from "react-icons/fi";
import { useSocket } from "../../hooks/useSocketContext";
import { AccountInfo } from "../../api/user";
import { useUserContext } from "../../context/UserContext";
import { ChatGroupInfo, createChatGroup, notificationFetcher } from "../../api/notification";
import { useAuthContext } from "../../hooks/useAuthContext";
import CreateGroupChatModal from "./CreateGroupChatModal";
import { useToastContext } from "../../hooks/useToastContext";

const MessageSidebar: React.FC = () => {
  const { allUsers, loading, loadMoreUsers, hasMore } = useUserContext();
  const {
    chatGroups,
    setChatGroups,
    chatGroupSelect,
    setChatGroupSelect,
    getUserIfPrivate,
  } = useMessageContext();
  const [searchTerm, setSearchTerm] = useState("");
  const loaderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onlineUsers } = useSocket();
  const { account, auth } = useAuthContext();
  const [chatGroupInfo, setChatGroupInfo] = useState<(AccountInfo | null)[]>(
    []
  );
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const { error } = useToastContext();
  const handleCreateGroup = async (groupData: createChatGroup) => {
    if (!auth?.token) return;
    try {
      const response = await notificationFetcher.createChatGroup(auth?.token, groupData);
      if (!response) return;
      setChatGroups([...chatGroups, response] as unknown as ChatGroupInfo[]);
      setChatGroupSelect(response as unknown as ChatGroupInfo);
    } catch (err) {
      console.error("Failed to create group:", err);
      error("Failed to create group chat", (err as Error).message);
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

  const handleChatClick = (chatGroup: ChatGroupInfo) => {
    setChatGroupSelect(chatGroup);
    console.log("Chat selected: ", chatGroup);
  };

  useEffect(() => {
    const fetchInfoPrivate = async () => {
      if (chatGroups.length === 0) return;
      const privateGroups = chatGroups.filter((group) => group.isPrivate);

      const info = privateGroups.map(
        (group) => getUserIfPrivate(group) || null
      );
      setChatGroupInfo(info);
    };
    fetchInfoPrivate();
  }, [chatGroups]);

  const renderChatAvatar = (chatGroup: ChatGroupInfo, userInfo: AccountInfo | null) => {
    if (chatGroup.isPrivate && userInfo) {
      return (
        <img
          src={userInfo.avatar}
          alt={userInfo.name}
          className="w-12 h-12 rounded-full"
        />
      );
    } else {
      // Group chat avatar
      return (
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
          <FiUsers className="w-6 h-6 text-white" />
        </div>
      );
    }
  };

  const renderChatInfo = (chatGroup: ChatGroupInfo, userInfo: AccountInfo | null) => {
    if (chatGroup.isPrivate && userInfo) {
      return {
        name: userInfo.name,
        subtitle: "Private Chat",
        isOnline: onlineUsers.includes(userInfo._id)
      };
    } else {
      return {
        name: chatGroup.groupName || `Group (${chatGroup.members.length} members)`,
        subtitle: `${chatGroup.members.length} members`,
        isOnline: false,
        memberNames: chatGroup.members.map((member) => {
          const user = allUsers.find((user) => user._id === member);
          return user?.name || "Unknown";
        }),
      };
    }
  };

  return (
    <div className="w-20 md:w-1/3 flex flex-col h-screen border-r border-gray-200 bg-white transition-all duration-300">
      {/* Header */}
      <div className="hidden md:block p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-2">Messages</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages"
            className="w-full p-2 pl-8 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <FiSearch className="w-5 h-5 text-gray-400" />
          </span>
        </div>
        <button
          className="btn btn-ghost btn-block justify-start normal-case"
          onClick={() => setIsGroupModalOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Create Group Chat
        </button>

        <CreateGroupChatModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          onCreateGroup={handleCreateGroup}
        />
      </div>

      {/* Mobile Search Icon */}
      <div className="md:hidden p-4 flex justify-center border-b border-gray-200">
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <FiSearch className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* User List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#CBD5E0 #F7FAFC",
        }}
      >
        {chatGroups.map((chatGroup, index) => {
          const userInfo = chatGroup.isPrivate ? chatGroupInfo[index] : null;
          const chatInfo = renderChatInfo(chatGroup, userInfo);

          return (
            <div
              key={chatGroup._id}
              onClick={() => handleChatClick(chatGroup)}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                chatGroupSelect?._id === chatGroup._id ? "bg-blue-100" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                {renderChatAvatar(chatGroup, userInfo)}
                {chatInfo.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="ml-3 flex-1 hidden md:block">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-gray-900">
                    {chatInfo.name}
                  </h3>
                  <span className="text-sm text-gray-500">12m</span>
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
    </div>
  );
};

export default MessageSidebar;
