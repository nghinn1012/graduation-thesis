import {
  rpcGetUserById,
  rpcGetUserByIds,
} from "../services/rpc.services";
import { RabbitMQ } from "./rpc";
import { RpcRequest } from "./rpc_req_and_res";

export interface IPagination {
  skip: number;
  limit: number;
}

export const RpcAction = {
  USER_RPC_GET_INFO: "rpcGetUserInfo",
  USER_RPC_GET_USER_BY_ID: "rpcGetUserById",
  USER_RPC_GET_AUTHORS: "rpcGetAuthors",
  USER_RPC_GET_USER_SUBCRIBERS_BY_USER_ID: "rpcGetUserSubcribersByUserId",
} as const;

export type RpcAction = (typeof RpcAction)[keyof typeof RpcAction];

export const brokerOperations = {
  mail: {
    ACTIVE_MANUAL_ACCOUNT: "ACTIVE_MANUAL_ACCOUNT",
    NEW_ACCOUNT_CREATED: "NEW_ACCOUNT_CREATED",
  },
  user: {
    NOTIFY_UPLOADS_IMAGE_COMPLETE: "NOTIFY_UPLOADS_IMAGE_COMPLETE",
    NOTIFY_NEW_FOLLOWER: "NOTIFY_NEW_FOLLOWER",
  }
} as const;

export interface IRpcGetInfoPayLoad {
  _id: string;
}

export interface IRpcGetUserByIdPayload {
  _id: string;
  select?: string | string[];
}

export interface IRpcGetUserSubcribersPayload {
  userId: string;
  pagination: IPagination;
}

export interface IRpcGetAuthorsPayload {
  _ids: string[];
  select?: string | string[];
}

export const initRpcConsumers = (rabbit: RabbitMQ): void => {
  // rabbit.listenRpc(
  //   RpcAction.USER_RPC_GET_INFO,
  //   (req: RpcRequest<IRpcGetInfoPayLoad>) => {
  //     return rpcGetUserInfo(req.payload._id);
  //   }
  // );

  rabbit.listenRpc(
    RpcAction.USER_RPC_GET_USER_BY_ID,
    (req: RpcRequest<IRpcGetUserByIdPayload>) => {
      const { _id, select } = req.payload;
      return rpcGetUserById(_id, select);
    }
  );

  rabbit.listenRpc(
    RpcAction.USER_RPC_GET_AUTHORS,
    (req: RpcRequest<IRpcGetAuthorsPayload>) => {
      const { _ids, select } = req.payload;
      return rpcGetUserByIds(_ids, select);
    }
  );

  // rabbit.listenRpc(
  //   RpcAction.USER_RPC_GET_USER_SUBCRIBERS_BY_USER_ID,
  //   (req: RpcRequest<IRpcGetUserSubcribersPayload>) => {
  //     const { userId, pagination } = req.payload;
  //     return rpcGetUserSubcribersByUserId(userId, pagination);
  //   }
  // );
};

export const initBrokerConsumners = (_rabbit: RabbitMQ): void => {
  // Do nothing
};
