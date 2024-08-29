import {
  POST_SERVICE_RPC_QUEUE, NOTIFICATION_SERVICE_RPC_QUEUE,
  USER_SERVICE_RPC_QUEUE
} from "../config/post.config";

export const RpcQueueName = {
  RPC_POST: POST_SERVICE_RPC_QUEUE,
  RPC_USER: USER_SERVICE_RPC_QUEUE,
  RPC_NOTIFICATION: NOTIFICATION_SERVICE_RPC_QUEUE
} as const;

export type RpcQueueName = typeof RpcQueueName[keyof typeof RpcQueueName];
