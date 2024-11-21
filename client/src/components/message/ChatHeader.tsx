import React, { useEffect, useRef, useState } from "react";
import { useMessageContext } from "../../context/MessageContext";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useUserContext } from "../../context/UserContext";
import { FaCamera } from "react-icons/fa";
import {
  EnhancedChatGroupInfo,
  notificationFetcher,
} from "../../api/notification";
import { useSocket } from "../../hooks/useSocketContext";
import AvatarUpdateModal from "./AvatarUpdateModal";
import { useI18nContext } from "../../hooks/useI18nContext";

const ChatHeader: React.FC = () => {
  const {
    chatGroupSelect,
    getUserIfPrivate,
    setChatGroupSelect,
    setChatGroups,
    chatGroups,
  } = useMessageContext();
  const { account, auth } = useAuthContext();
  const { allUsers } = useUserContext();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { socket } = useSocket();
  const languageContext = useI18nContext();
  const lang = languageContext.of("MessageSection");

  const userIfPrivate =
    chatGroupSelect && chatGroupSelect.isPrivate
      ? getUserIfPrivate(chatGroupSelect)
      : null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setSelectedFile(file);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!auth?.token || !chatGroupSelect?._id) return;
    if (selectedFile) {
      try {
        await notificationFetcher.updateChatGroupAvatar(auth.token, {
          chatGroupId: chatGroupSelect?._id,
          avatarUrl: avatarPreview || "",
        });
      } catch (error) {
        console.error(lang("fail-change-avatar"), error);
      }
    }

    closeModal();
  };

  useEffect(() => {
    if (!socket) return;
    socket.on(
      "chatGroupAvatarUpdated",
      (data: { chatGroupId: string; newAvatarUrl: string }) => {
        if (data.chatGroupId === chatGroupSelect?._id) {
          setChatGroupSelect({
            ...chatGroupSelect,
            avatarUrl: data.newAvatarUrl,
          } as EnhancedChatGroupInfo);

          setChatGroups(
            chatGroups.map((group) => {
              if (group._id === chatGroupSelect._id) {
                return {
                  ...group,
                  avatarUrl: data.newAvatarUrl,
                };
              }
              return group;
            })
          );
        }
      }
    );
    return () => {
      socket.off("chatGroupAvatarUpdated");
    };
  }, [chatGroupSelect?._id, socket, setChatGroupSelect, setChatGroups]);

  const closeModal = () => {
    setIsModalOpen(false);
    setAvatarPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-300 p-2 bg-white">
      {chatGroupSelect ? (
        <div className="flex items-center w-full">
          {chatGroupSelect.isPrivate && userIfPrivate ? (
            <div className="flex items-center flex-1 min-w-0">
              <img
                src={userIfPrivate.avatar || "default_user_icon.png"}
                alt={userIfPrivate.name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="ml-2 min-w-0">
                <p className="font-bold truncate">{userIfPrivate.name}</p>
                <p className="text-sm text-gray-600 truncate">
                  @{userIfPrivate.username}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center flex-1 min-w-0">
              <img
                src={chatGroupSelect.avatarUrl || "default_group_icon.png"}
                alt={chatGroupSelect.groupName}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="ml-2 min-w-0">
                <p className="font-bold truncate">
                  {chatGroupSelect.groupName}
                </p>
              </div>
            </div>
          )}
          {!chatGroupSelect.isPrivate && (
            <div className="ml-4 flex-shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <button
                onClick={triggerFileInput}
                className="bg-transparent hover:bg-gray-200 rounded-full p-1"
              >
                <FaCamera className="text-gray-600" size={24} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="font-bold">{lang("selectUser")}</p>
      )}

      <AvatarUpdateModal
        isOpen={isModalOpen}
        avatarPreview={avatarPreview}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </div>
  );
};

export default ChatHeader;
