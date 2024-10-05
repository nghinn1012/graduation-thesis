import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { AccountInfo } from "../api/user";
import { ChatGroupInfo, MessageInfo, notificationFetcher } from "../api/notification";
import { useAuthContext } from "../hooks/useAuthContext";
import { useUserContext } from "./UserContext";
import { useSocket } from "../hooks/useSocketContext";

interface MessageContextProps {
  chatGroupSelect: ChatGroupInfo | null;
  setChatGroupSelect: (user: ChatGroupInfo | null) => void;
  chatGroups: ChatGroupInfo[];
  setChatGroups: (groups: ChatGroupInfo[]) => void;
  getUserIfPrivate: (chatGroup: ChatGroupInfo) => AccountInfo | undefined;
  getMessagesOfChatGroup: (chatGroupId: string) => void;
  chatMessages: MessageInfo[];
  setChatMessages: (messages: MessageInfo[]) => void;
  getInfoUsersOfGroup: (chatGroup: ChatGroupInfo) => AccountInfo[];
}

const MessageContext = createContext<MessageContextProps | undefined>(
  undefined
);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chatGroupSelect, setChatGroupSelect] = useState<ChatGroupInfo | null>(
    null
  );
  const [chatGroups, setChatGroups] = useState<ChatGroupInfo[]>([]);
  const [chatMessages, setChatMessages] = useState<MessageInfo[]>([]);
  const { auth, account } = useAuthContext();
  const { allUsers } = useUserContext();

  useEffect(() => {
    const loadChatGroup = async () => {
      if (!auth?.token) return;
      const response = (await notificationFetcher.getChatGroups(
        auth.token
      )) as unknown as ChatGroupInfo[];
      if (response) {
        setChatGroups(response);
      }
    };

    loadChatGroup();
  }, [auth]);

  const getUserIfPrivate = (chatGroup: ChatGroupInfo) => {
    const userId = chatGroup.members.find((member) => member !== account?._id);
    const userInfo = allUsers.find((user) => user._id === userId);
    return userInfo;
  };

  const getMessagesOfChatGroup = async (chatGroupId: string) => {
    if (!auth?.token) return;
    const response = (await notificationFetcher.getMessagesOfGroup(
      chatGroupId,
      auth.token
    )) as unknown as MessageInfo[];
    if (response) {
      setChatMessages(response);
    }
  }

  useEffect(() => {
    if (chatGroupSelect) {
      getMessagesOfChatGroup(chatGroupSelect._id);
    }
    console.log("Chat messages: ", chatMessages);
  }, [chatGroupSelect]);

  const getInfoUsersOfGroup = (chatGroup: ChatGroupInfo) => {
    const userInfos = chatGroup.members
      .filter((memberId) => memberId !== account?._id)
      .map((memberId) => allUsers.find((user) => user._id === memberId))
      .filter((userInfo) => userInfo) as AccountInfo[];

    return userInfos;
  };


  return (
    <MessageContext.Provider
      value={{
        chatGroupSelect,
        setChatGroupSelect,
        chatGroups,
        setChatGroups,
        getUserIfPrivate,
        getMessagesOfChatGroup,
        chatMessages,
        setChatMessages,
        getInfoUsersOfGroup,

      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }
  return context;
};
