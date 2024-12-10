import React, { useEffect, useRef, useState } from "react";
import {
  FiSearch,
  FiMoreVertical,
  FiEdit2,
  FiImage,
  FiX,
  FiMenu,
} from "react-icons/fi";

import { useMessageContext } from "../../context/MessageContext";
import { useSocket } from "../../hooks/useSocketContext";
import { useUserContext } from "../../context/UserContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useToastContext } from "../../hooks/useToastContext";

import CreateChatModal from "./CreateGroupChatModal";
import NewChatButtons from "./NewChatButtons";
import {
  ChatGroupInfo,
  createChatGroup,
  EnhancedChatGroupInfo,
  notificationFetcher,
} from "../../api/notification";
import { AccountInfo } from "../../api/user";
import AvatarUpdateModal from "./AvatarUpdateModal";
import GroupNameChangeModal from "./GroupNameChangeModal";
import { useI18nContext } from "../../hooks/useI18nContext";

interface ChatDisplayInfo {
  name: string;
  avatar: string;
  subtitle: string;
  isOnline: boolean;
}

const MessageSidebar: React.FC = () => {
  const { allUsers, loading, loadMoreUsers, hasMore } = useUserContext();

  const {
    chatGroups,
    setChatGroups,
    chatGroupSelect,
    setChatGroupSelect,
    updateChatGroupName,
    markMessagesOfGroupAsRead,
  } = useMessageContext();

  const { onlineUsers } = useSocket();
  const { account, auth } = useAuthContext();
  const { error, success } = useToastContext();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateGroup, setIsCreateGroup] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedChatGroup, setSelectedChatGroup] =
    useState<EnhancedChatGroupInfo | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const languageContext = useI18nContext();
  const lang = languageContext.of("MessageSection");

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return lang("now");

    if (diffMinutes < 60) return lang("minutesAgo", diffMinutes);

    if (diffMinutes < 1440)
      return lang("hoursAgo", Math.floor(diffMinutes / 60));

    const diffDays = Math.floor(diffMinutes / (60 * 24));
    if (diffDays < 7) return lang("daysAgo", diffDays);

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return lang("weeksAgo", diffWeeks);

    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return lang("monthsAgo", diffMonths);

    const diffYears = Math.floor(diffDays / 365);
    return lang("yearsAgo", diffYears);
  };

  const getOtherUser = (
    chatGroup: EnhancedChatGroupInfo
  ): AccountInfo | null => {
    if (!account || chatGroup.members.length > 2) return null;
    const otherUser = chatGroup?.memberDetails?.find(
      (member) => member._id !== account._id
    );
    return otherUser || null;
  };

  const getChatDisplayInfo = (
    chatGroup: EnhancedChatGroupInfo
  ): ChatDisplayInfo => {
    const otherUser = getOtherUser(chatGroup);
    // console.log(otherUser);
    if (otherUser) {
      return {
        name: otherUser.name,
        avatar: otherUser.avatar || "",
        subtitle: chatGroup.isPrivate ? lang("privateMessage") : lang("chat"),
        isOnline: onlineUsers.includes(otherUser._id),
      };
    }
    // console.log(chatGroup);

    return {
      name: chatGroup.groupName || lang("groupChat"),
      avatar: chatGroup.avatarUrl || "",
      subtitle: lang("memberCount", { count: chatGroup.members.length }),
      isOnline: false,
    };
  };

  const renderLastMessage = (chatGroup: EnhancedChatGroupInfo) => {
    if (!chatGroup.lastMessageInfo) return null;

    const sender = chatGroup?.memberDetails?.find(
      (member) => member._id === chatGroup?.lastMessageInfo?.senderId
    ) || null;

    const content =
      chatGroup.lastMessageInfo.text ||
      chatGroup.lastMessageInfo.emoji ||
      lang("photoMessage");

    const isSender = chatGroup.lastMessageInfo.senderId === account?._id;
    const senderName = isSender ? lang("you") : sender?.name || lang("someone");

    return {
      content: `${senderName}: ${content}`,
      time: formatTime(chatGroup.lastMessageInfo.createdAt),
    };
  };

  // Event Handlers
  const handleNewChat = () => {
    setIsModalOpen(true);
    setIsCreateGroup(false);
    setIsMobileSidebarOpen(false);
  };

  const handleNewGroup = () => {
    setIsModalOpen(true);
    setIsCreateGroup(true);
    setIsMobileSidebarOpen(false);
  };

  const handleChatClick = (chatGroup: EnhancedChatGroupInfo) => {
    setChatGroupSelect(chatGroup);
    markMessagesOfGroupAsRead(chatGroup._id);
    setIsMobileSidebarOpen(false);
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
      console.log(newChat);
      setChatGroups([...chatGroups, {
        ...newChat,
        memberDetails: chatData.memberDetails,
      }]);
      setChatGroupSelect(newChat);
      setIsModalOpen(false);
    } catch (err) {
      console.error(lang("createChatFailed"), err);
      error(lang("createChatFailed"), (err as Error).message);
    }
  };

  const handleChatOptions = async (
    chatGroup: EnhancedChatGroupInfo,
    action: "rename" | "changeAvatar"
  ) => {
    if (chatGroup.isPrivate) return;

    try {
      switch (action) {
        case "rename":
          setSelectedChatGroup(chatGroup);
          setIsNameModalOpen(true);
          break;
        case "changeAvatar":
          setSelectedChatGroup(chatGroup);
          triggerFileInput();
          break;
      }
    } catch (err) {
      error("Thao tác thất bại", (err as Error).message);
    }
  };
  // New function to handle avatar change
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setSelectedFile(file);
        setIsAvatarModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarSubmit = async () => {
    if (!auth?.token || !selectedChatGroup?._id) return;
    if (selectedFile) {
      try {
        const response = await notificationFetcher.updateChatGroupAvatar(
          auth.token,
          {
            chatGroupId: selectedChatGroup._id,
            avatarUrl: avatarPreview || "",
          }
        );

        setChatGroups(
          chatGroups.map((group) =>
            group._id === selectedChatGroup._id
              ? { ...group, avatarUrl: avatarPreview || "" }
              : group
          )
        );

        success("Đổi ảnh đại diện thành công");
      } catch (err) {
        console.error("Failed to update avatar", err);
        error("Thao tác thất bại", (err as Error).message);
      }
    }

    closeAvatarModal();
  };

  const handleNameChange = async (newName: string) => {
    if (!auth?.token || !selectedChatGroup?._id) return;

    try {
      updateChatGroupName(selectedChatGroup._id, newName);
      success(lang("rename-group-success"));
    } catch (err) {
      console.error("Failed to rename group", err);
      error(lang("rename-group-fail", (err as Error).message));
    }

    setIsNameModalOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false);
    setAvatarPreview(null);
    setSelectedFile(null);
    setSelectedChatGroup(null);
  };

  const getFilteredChats = () => {
    return chatGroups
      .filter((chat) => {
        const displayInfo = getChatDisplayInfo(chat);
        return displayInfo.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => {
        const timeA = a.lastMessageInfo?.createdAt || "";
        const timeB = b.lastMessageInfo?.createdAt || "";
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
  };

  // useEffect(() => {
  //   socket.on('newMessage', (message) => {
  //     if (message.senderId !== account?._id) {
  //       setChatGroups(prevGroups => prevGroups.map(group =>
  //         group._id === message.chatGroupId
  //           ? { ...group, unreadCount: (group.unreadCount || 0) + 1 }
  //           : group
  //       ));
  //     }
  //   });

  //   return () => {
  //     socket.off('newMessage');
  //   };
  // }, [account?._id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadMoreUsers();
        }
      },
      { root: containerRef.current, rootMargin: "20px", threshold: 0.1 }
    );

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
    <>
      {/* Mobile Header - Only visible on mobile devices */}
      <div className="md:hidden fixed top-0 left-0 bg-white z-20 pl-3 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="mr-4 btn btn-ghost btn-square"
          >
            <FiMenu className="text-gray-500 text-xl" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay - Provides background dimming */}
      <div
        className={`
        fixed inset-0 bg-black/50 z-30
        ${isMobileSidebarOpen ? "block" : "hidden"}
        md:hidden
      `}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* Sidebar Container - Responsive Layout */}
      <div
        className={`
        w-[300px] md:w-1/3 flex flex-col h-screen border-r border-gray-200
        fixed top-0 left-0 z-40 bg-white
        transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0
      `}
      >
        {/* Mobile Sidebar Close Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 z-50 btn btn-ghost btn-square"
        >
          <FiX className="text-gray-500 text-xl" />
        </button>

        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold mb-2">{lang("message")}</h2>
        </div>
        <div className="relative m-2">
          <input
            type="text"
            placeholder={lang("searchPlaceholder")}
            className="w-full p-2 pl-8 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FiSearch className="absolute left-2 bottom-12 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <NewChatButtons
            onNewChat={handleNewChat}
            onNewGroup={handleNewGroup}
          />
        </div>

        {/* Chat List Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
        >
          {filteredChats.map((chatGroup) => {
            const displayInfo = getChatDisplayInfo(chatGroup);
            const lastMessage = renderLastMessage(chatGroup);

            return (
              <div
                key={chatGroup._id}
                onClick={() => handleChatClick(chatGroup)}
                className={`
          flex items-center p-4 hover:bg-gray-50 cursor-pointer
          ${chatGroupSelect?._id === chatGroup._id ? "bg-blue-100" : ""}
        `}
              >
                {/* Avatar Section */}
                <div className="relative">
                  {displayInfo.avatar ? (
                    <img
                      src={displayInfo.avatar}
                      alt={displayInfo.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-white">
                        {displayInfo.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {displayInfo.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>

                {/* Chat Info */}
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold truncate max-w-[150px]">
                      {displayInfo.name}
                    </h3>
                    {chatGroup.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-500 text-white rounded-full">
                        {chatGroup.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline">
                    <p className="text-sm text-gray-500 truncate max-w-[100px]">
                      {lastMessage?.content ||
                        lang("chatSubtitle")}
                    </p>
                    {lastMessage && (
                      <>
                        <span className="text-sm text-gray-500 mx-1">•</span>
                        <span className="text-sm text-gray-500">
                          {lastMessage.time}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Chat Options for Group Chats */}
                {!chatGroup.isPrivate && (
                  <div className="dropdown dropdown-end z-100">
                    <label
                      tabIndex={0}
                      className="btn btn-ghost btn-square btn-xs cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiMoreVertical className="text-gray-500" />
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <a
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChatOptions(chatGroup, "rename");
                          }}
                        >
                          <FiEdit2 className="mr-2" /> {lang("rename")}
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChatOptions(chatGroup, "changeAvatar");
                          }}
                        >
                          <FiImage className="mr-2" /> {lang("changeAvatar")}
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          <div ref={loaderRef} className="p-4 text-center">
            {loading && (
              <div className="flex justify-center items-center space-x-1">
                {[1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${dot * 0.2}s` }}
                  ></div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Existing modals remain the same */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleAvatarChange}
        style={{ display: "none" }}
      />

      <CreateChatModal
        onCreateChat={handleCreateChat}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsCreateGroup(false);
        }}
        initialChatType={isCreateGroup ? "group" : "private"}
      />

      <AvatarUpdateModal
        isOpen={isAvatarModalOpen}
        avatarPreview={avatarPreview}
        onSubmit={handleAvatarSubmit}
        onClose={closeAvatarModal}
      />

      <GroupNameChangeModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        onNameChange={handleNameChange}
        chatGroupId={selectedChatGroup?._id}
        currentGroupName={selectedChatGroup?.groupName || ""}
      />
    </>
  );
};

export default MessageSidebar;
