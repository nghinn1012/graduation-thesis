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
        const response = await notificationFetcher.updateChatGroupAvatar(
          auth.token,
          {
            chatGroupId: chatGroupSelect?._id,
            avatarUrl: avatarPreview || "",
          }
        );
      } catch (error) {
        console.error("Failed to update avatar", error);
      }
    }

    setIsModalOpen(false);
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
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-300 p-2 bg-white">
      {chatGroupSelect ? (
        <>
          {chatGroupSelect.isPrivate && userIfPrivate ? (
            <div className="flex items-center">
              <img
                src={
                  userIfPrivate.avatar ||
                  "default_user_icon.png"
                }
                alt={userIfPrivate.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-2">
                <p className="font-bold">{userIfPrivate.name}</p>
                <p className="text-sm text-gray-600">
                  @{userIfPrivate.username}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <img
                src={chatGroupSelect.avatarUrl || "default_group_icon.png"}
                alt={chatGroupSelect.groupName}
                className="w-10 h-10 rounded-full"
              />
              <div className="ml-2">
                <p className="font-bold">{chatGroupSelect.groupName}</p>
              </div>
            </div>
          )}
          {!chatGroupSelect.isPrivate && (
            <div className="ml-4">
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
        </>
      ) : (
        <p className="font-bold">Select a user to chat</p>
      )}

      {/* DaisyUI Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Preview Avatar</h3>
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="w-32 h-32 rounded-full mx-auto my-4"
              />
            )}
            <div className="modal-action">
              <button onClick={handleSubmit} className="btn btn-primary">
                Submit
              </button>
              <button onClick={closeModal} className="btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
