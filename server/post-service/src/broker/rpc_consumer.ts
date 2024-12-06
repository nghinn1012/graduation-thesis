import { RabbitMQ } from "./rpc";

export const RpcAction = {
  USER_RPC_GET_INFO: "rpcGetUserInfo",
  USER_RPC_GET_USER_BY_ID: "rpcGetUserById",
  USER_RPC_GET_AUTHORS: "rpcGetAuthors",
  USER_RPC_GET_USER_MENTIONED: "rpcGetUserMentioned",
  USER_RPC_GET_USER_SUBCRIBERS_BY_USER_ID: "rpcGetUserSubcribersByUserId",
  NOTIFICATION_RPC_UPLOADS_COMPLETE: "rpcSendUploadsComplete",
  USER_RPC_UPDATE_REPORT_COUNT: "rpcUpdateReportCount",
} as const;

export type RpcAction = (typeof RpcAction)[keyof typeof RpcAction];

export const brokerOperations = {
  mail: {
    ACTIVE_MANUAL_ACCOUNT: "ACTIVE_MANUAL_ACCOUNT",
    NEW_ACCOUNT_CREATED: "NEW_ACCOUNT_CREATED",
  },
  food: {
    NOTIFY_NEW_FOOD: "NOTIFY_NEW_FOOD",
    NOTIFY_FOOD_LIKED: "NOTIFY_FOOD_LIKED",
    NOTIFY_FOOD_UPLOAD_COMPLETE: "NOTIFY_FOOD_UPLOAD_COMPLETE",
    NOTIFY_MADE_UPLOAD_COMPLETE: "NOTIFY_MADE_UPLOAD_COMPLETE",
    NOTIFY_FOOD_COMMENTED: "NOTIFY_FOOD_COMMENTED",
    NOTIFY_FOOD_SAVED: "NOTIFY_FOOD_SAVED",
    NOTIFY_FOOD_MADE: "NOTIFY_FOOD_MADE",
    NOTIFY_SEND_REPORT: "NOTIFY_SEND_REPORT",
  },
  user: {
    USER_UPDATE_REPORT_COUNT: "USER_UPDATE_REPORT_COUNT",
  },
} as const;

export interface IRpcGetInfoPayLoad {
  _id: string;
}

export interface IRpcGetUserByIdPayload {
  _id: string;
  select?: string | string[];
}

export interface IRpcGetAuthorsPayload {
  _ids: string[];
  select?: string | string[];
}
export const initRpcConsumers = (_rabbit: RabbitMQ): void => {
  // Do nothing
};

export const initBrokerConsumners = (_rabbit: RabbitMQ): void => {
  // Do nothing
};
