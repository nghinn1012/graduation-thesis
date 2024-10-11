import axios, { AxiosError } from "axios";
import { NOTIFICATION_PATH, PROXY_URL } from "../config/config";
import { ResponseErrorLike } from "../data/response_error_like";
import { ResponseLike } from "../data/respone_like";
import { UserErrorReason, UserErrorTarget } from "../data/user_error";
import { AccountInfo, UserResponseError } from "./user";

export const notificationEndpoints = {
  // notifications
  getChatGroups: "/notifications/getChatGroups",
  getMessagesOfGroup: "/notifications/getMessages/:chatGroupId",
  sendMessage: "/notifications/sendMessage",
  createChatGroup: "/notifications/createChatGroup",

  // notifications
  getNotifications: "/notifications/getAllNotifications",
} as const;

export interface NotificationResponseError
  extends ResponseErrorLike<UserErrorTarget, UserErrorReason> { }
export interface NotificationResponse<DataLike>
  extends ResponseLike<DataLike, UserResponseError> {
  token(token: any): unknown;
}

const userUrl = `${PROXY_URL}/${NOTIFICATION_PATH}`;

export const notificationInstance = axios.create({
  baseURL: userUrl,
  timeout: 2000,
});

notificationInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const response = error.response;
    if (typeof response?.data === "object") {
      const data = response.data as ResponseLike<
        unknown,
        ResponseErrorLike<unknown, unknown>
      >;
      return Promise.reject(data.error);
    }
    const _error: ResponseErrorLike<unknown, unknown> = {
      code: response?.status ?? 500,
      message: "",
    };
    return Promise.reject(_error);
  }
);

export interface ChatGroupInfo {
  _id: string;
  groupName: string;
  members: string[];
  createdBy: string;
  isPrivate: boolean;
  lastMessage: string;
}

export interface EnhancedChatGroupInfo extends ChatGroupInfo {
  updatedAt: any;
  createdAt: any;
  lastMessageInfo?: {
    _id: string;
    text?: string;
    imageUrl?: string;
    emoji?: string;
    createdAt: string;
    senderId: string;
  };
}

export interface MessageInfo {
  messageContent: any;
  _id: string;
  chatGroup: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  emoji?: string;
  productLink?: string;
  createdAt: string;
}

export interface createMessage {
  chatGroupId: string;
  senderId: string;
  receiverId: string[];
  messageContent: {
    text: string;
    imageUrl?: string;
    emoji?: string;
    productLink?: string;
  }
}

export interface createChatGroup {
  groupName: string;
  members: string[];
  createdBy: string;
  isPrivate: boolean;
}

export interface NotificationInfo {
  _id: string;
  user: AccountInfo;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface NotificationFetcher {
  getChatGroups: (token: string) => Promise<NotificationResponse<ChatGroupInfo[]>>;
  getMessagesOfGroup: (chatGroupId: string, token: string, page: number, limit: number) => Promise<NotificationResponse<MessageInfo[]>>;
  sendMessage: (token: string, messageInfo: createMessage) => Promise<NotificationResponse<MessageInfo>>;
  createChatGroup: (token: string, groupData: createChatGroup) => Promise<NotificationResponse<ChatGroupInfo>>;
  getNotifications: (token: string) => Promise<NotificationResponse<NotificationInfo[]>>;
}

export const notificationFetcher: NotificationFetcher = {
  getChatGroups: async (token) => {
    return notificationInstance.get(notificationEndpoints.getChatGroups, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    );
  },
  getMessagesOfGroup: async (chatGroupId, token, page, limit) => {
    return notificationInstance.get(notificationEndpoints.getMessagesOfGroup.replace(":chatGroupId", chatGroupId), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        limit,
      },
    },
    );
  },
  sendMessage: async (token, messageInfo) => {
    return notificationInstance.post(notificationEndpoints.sendMessage, messageInfo, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    );
  },
  createChatGroup: async (token, groupData) => {
    return notificationInstance.post(notificationEndpoints.createChatGroup, groupData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    );
  },
  getNotifications: async (token) => {
    return notificationInstance.get(notificationEndpoints.getNotifications, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    );
  }
};
