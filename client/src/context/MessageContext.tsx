import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { AccountInfo } from "../api/user";
import { ChatGroupInfo, EnhancedChatGroupInfo, MessageInfo, notificationFetcher } from "../api/notification";
import { useAuthContext } from "../hooks/useAuthContext";
import { useUserContext } from "./UserContext";

interface MessageContextProps {
  chatGroupSelect: EnhancedChatGroupInfo | null;
  setChatGroupSelect: (user: EnhancedChatGroupInfo | null) => void;
  chatGroups: EnhancedChatGroupInfo[];
  setChatGroups: (groups: EnhancedChatGroupInfo[]) => void;
  getUserIfPrivate: (chatGroup: EnhancedChatGroupInfo) => AccountInfo | undefined;
  getMessagesOfChatGroup: (chatGroupId: string, page?: number) => void;
  chatMessages: MessageInfo[];
  setChatMessages: (messages: MessageInfo[]) => void;
  getInfoUsersOfGroup: (chatGroup: EnhancedChatGroupInfo) => AccountInfo[];
  loadMoreMessages: () => void;
  hasMoreMessages: boolean;
  addMessage: (newMessage: MessageInfo) => void;
}

const MessageContext = createContext<MessageContextProps | undefined>(
  undefined
);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chatGroupSelect, setChatGroupSelect] = useState<EnhancedChatGroupInfo | null>(
    null
  );
  const [chatGroups, setChatGroups] = useState<EnhancedChatGroupInfo[]>([]);
  const [chatMessages, setChatMessages] = useState<MessageInfo[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  const limit = 10;
  const { auth, account } = useAuthContext();
  const { allUsers } = useUserContext();

  const addMessage = useCallback((newMessage: MessageInfo) => {
    setChatMessages(prevMessages => {
      const isMessageAlreadyAdded = prevMessages.some(msg =>
        msg?._id === newMessage?._id ||
        (msg?.senderId === newMessage?.senderId &&
         msg?.messageContent?.text === newMessage.messageContent?.text &&
         Math.abs(new Date(msg.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 1000)
      );

      if (isMessageAlreadyAdded) {
        return prevMessages;
      }
      return [...prevMessages, newMessage];
    });
  }, []);


  useEffect(() => {
    const loadChatGroup = async () => {
      if (!auth?.token) return;
      const response = (await notificationFetcher.getChatGroups(
        auth.token
      )) as unknown as EnhancedChatGroupInfo[];
      if (response) {
        setChatGroups(response);
      }
    };

    loadChatGroup();
  }, [auth]);

  const getUserIfPrivate = (chatGroup: EnhancedChatGroupInfo) => {
    const userId = chatGroup.members.find((member) => member !== account?._id);
    const userInfo = allUsers.find((user) => user._id === userId);
    return userInfo;
  };

  const getMessagesOfChatGroup = async (chatGroupId: string, page: number = 1) => {
    if (!auth?.token) return;
    const response = await notificationFetcher.getMessagesOfGroup(
      chatGroupId,
      auth.token,
      page,
      limit
    );
    const data = response.data as unknown as MessageInfo[];

    if (data.length > 0) {
      if (page === 1) {
        setChatMessages(data);
      } else {
        setChatMessages(prevMessages => [...data, ...prevMessages]);
      }
      setHasMoreMessages(data.length === limit);
    } else {
      setHasMoreMessages(false);
    }
  };

  useEffect(() => {
    if (chatGroupSelect) {
      setChatMessages([]);
      setHasMoreMessages(true);
      setCurrentPage(1);
      getMessagesOfChatGroup(chatGroupSelect._id, 1);
    }
  }, [chatGroupSelect]);

  const loadMoreMessages = () => {
    if (chatGroupSelect && hasMoreMessages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      getMessagesOfChatGroup(chatGroupSelect._id, nextPage);
    }
  };

  const getInfoUsersOfGroup = (chatGroup: EnhancedChatGroupInfo) => {
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
        loadMoreMessages,
        hasMoreMessages,
        addMessage
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
