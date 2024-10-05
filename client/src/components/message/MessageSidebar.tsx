import React, { useEffect, useRef, useState } from "react";
import { useMessageContext } from "../../context/MessageContext";
import { FiSearch } from "react-icons/fi";
import { useSocket } from "../../hooks/useSocketContext";
import { AccountInfo } from "../../api/user";
import { useUserContext } from "../../context/UserContext";
import { ChatGroupInfo } from "../../api/notification";
import { useAuthContext } from "../../hooks/useAuthContext";

const MessageSidebar: React.FC = () => {
  const { allUsers, loading, loadMoreUsers, hasMore } = useUserContext();
  const { chatGroups, setChatGroups, chatGroupSelect, setChatGroupSelect, getUserIfPrivate } = useMessageContext();
  const [searchTerm, setSearchTerm] = useState("");
  const loaderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onlineUsers } = useSocket();
  const { account } = useAuthContext();
  const [chatGroupInfo, setChatGroupInfo] = useState<(AccountInfo | null)[]>([]);

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

  // Function to handle user selection
  const handleChatClick = (chatGroup: ChatGroupInfo) => {
    setChatGroupSelect(chatGroup);
    console.log("Chat selected: ", chatGroup);
  };


  useEffect(() => {
    const fetchInfoPrivate = async () => {
      if (chatGroups.length === 0) return;
      const privateGroups = chatGroups.filter((group) => group.isPrivate);

      const info = privateGroups.map((group) => getUserIfPrivate(group) || null);
      setChatGroupInfo(info);
    };
    fetchInfoPrivate();
  }, [chatGroups]);

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

          return (
            <div
              key={chatGroup._id}
              onClick={() => handleChatClick(chatGroup)}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                chatGroupSelect?._id === chatGroup._id ? "bg-blue-100" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                {userInfo ? (
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  // Placeholder while user info is loading
                  <div className="w-12 h-12 rounded-full bg-gray-300 animate-pulse"></div>
                )}
                {userInfo && onlineUsers.includes(userInfo._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="ml-3 flex-1 hidden md:block">
                {userInfo ? (
                  <>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-gray-900">{userInfo.name}</h3>
                      <span className="text-sm text-gray-500">12m</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">Private Chat</p>
                  </>
                ) : (
                  // Display loading state while fetching private chat info
                  <div className="h-4 bg-gray-300 rounded w-3/4 animate-pulse"></div>
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
    </div>
  );
};

export default MessageSidebar;
