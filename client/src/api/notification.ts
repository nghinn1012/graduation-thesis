import axios, { AxiosError } from "axios";
import { NOTIFICATION_PATH, PROXY_URL } from "../config/config";
import { ResponseErrorLike } from "../data/response_error_like";
import { ResponseLike } from "../data/respone_like";
import { UserErrorReason, UserErrorTarget } from "../data/user_error";
import { AccountInfo, UserResponseError } from "./user";

export const notificationEndpoints = {
  // messages
  getChatGroups: "/notifications/getChatGroups",
  getMessagesOfGroup: "/notifications/getMessages/:chatGroupId",
  sendMessage: "/notifications/sendMessage",
  createChatGroup: "/notifications/createChatGroup",
  updateChatGroupAvatar: "/notifications/updateChatGroupAvatar",
  updateChatGroupName: "/notifications/updateChatGroupName",
  markMesssageOfGroupAsRead: "/notifications/markAllMessagesAsRead",

  // notifications
  getNotifications: "/notifications/getAllNotifications",
  markNotificationAsRead: "/notifications/markNotificationAsRead/:notificationId",
  markAllNotificationsAsRead: "/notifications/markAllNotificationsAsRead",
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
  updatedAt?: any;
  createdAt?: any;
  avatarUrl?: string | undefined;
  lastMessageInfo?: {
    _id: string;
    text?: string;
    imageUrl?: string;
    emoji?: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
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
  post: {
    _id: string;
    title: string;
    image: string;
  };
  author: {
    _id: string;
    username: string;
    avatar: string;
    name: string;
  }
}

export interface NotificationLoad {
  notifications: NotificationInfo[];
  hasMore: boolean;
  unreadCount: number;
}

export interface updateChatGroupAvatar {
  chatGroupId: string;
  avatarUrl: string;
}

export interface MarkAsReadInfo {
  notificationId: string;
}

export interface MessageFetchInfo {
  data: {
    messages: MessageInfo[];
    page: number;
    limit: number;
    totalPages: number;
    totalMessages: number;
  }
}

export interface NameUpdateInfo {
  chatGroupId: string;
  groupName: string;
}

export interface NotificationFetcher {
  getChatGroups: (token: string) => Promise<NotificationResponse<ChatGroupInfo[]>>;
  getMessagesOfGroup: (chatGroupId: string, token: string, page: number, limit: number) => Promise<NotificationResponse<MessageFetchInfo>>;
  sendMessage: (token: string, messageInfo: createMessage) => Promise<NotificationResponse<MessageInfo>>;
  createChatGroup: (token: string, groupData: createChatGroup) => Promise<NotificationResponse<ChatGroupInfo>>;
  getNotifications: (token: string, page?: number) => Promise<NotificationResponse<NotificationLoad>>;
  updateChatGroupAvatar: (token: string, updateData: updateChatGroupAvatar) => Promise<NotificationResponse<ChatGroupInfo>>;
  updateChatGroupName: (token: string, updateData: NameUpdateInfo) => Promise<NotificationResponse<ChatGroupInfo>>;
  markNotificationAsRead: (token: string, markAsReadInfo: MarkAsReadInfo) => Promise<NotificationResponse<NotificationInfo>>;
  markAllNotificationsAsRead: (token: string) => Promise<NotificationResponse<NotificationInfo>>;
  markAllMessagesAsRead: (token: string, chatGroupId: string) => Promise<NotificationResponse<ChatGroupInfo>>;
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
  getNotifications: async (token, page) => {
    return notificationInstance.get(notificationEndpoints.getNotifications, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page: page,
      },
    },
    );
  },
  updateChatGroupAvatar: async (token: string, updateData: updateChatGroupAvatar) => {
    return notificationInstance.patch(notificationEndpoints.updateChatGroupAvatar, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    );
  },
  updateChatGroupName: async (token, updateData) => {
    return notificationInstance.patch(notificationEndpoints.updateChatGroupName, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    );
  },
  markNotificationAsRead: async (token, markAsReadInfo) => {
    return notificationInstance.patch(notificationEndpoints.markNotificationAsRead.replace(":notificationId", markAsReadInfo.notificationId), markAsReadInfo, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    );
  },
  markAllNotificationsAsRead: async (token) => {
    return notificationInstance.patch(notificationEndpoints.markAllNotificationsAsRead, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    );
  },
  markAllMessagesAsRead: async (token, chatGroupId) => {
    return notificationInstance.post(notificationEndpoints.markMesssageOfGroupAsRead, {
      chatGroupId,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    );
  },
};
