import {
  NOTIFICATION_SERVICE,
  USER_SERVICE,
  POST_SERVICE,
  USER_SERVICE_RPC_QUEUE,
  NOTIFICATION_SERVICE_RPC_QUEUE,
  POST_SERVICE_RPC_QUEUE,
} from "../config/notification.config";

export const RpcSource = {
  USER: USER_SERVICE_RPC_QUEUE,
  NOTIFICATION: NOTIFICATION_SERVICE_RPC_QUEUE,
  POST: POST_SERVICE_RPC_QUEUE,
} as const;

export type RpcSource = (typeof RpcSource)[keyof typeof RpcSource];

export const BrokerSource = {
  USER: USER_SERVICE,
  NOTIFICATION: NOTIFICATION_SERVICE,
  POST: POST_SERVICE,
} as const;

export type BrokerSource = (typeof BrokerSource)[keyof typeof BrokerSource];
