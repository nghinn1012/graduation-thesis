import {
  IRpcGetUserByIdPayload,
  RabbitMQ,
  RpcAction,
  RpcQueueName,
  RpcRequest,
  RpcSource,
} from "../broker";

export interface Id {
  _id: string;
}

export const rpcGetUser = async <T>(
  user?: string,
  select?: string | string[]
): Promise<T | null> => {
  if (user == null) return null;
  const rpcUserRequest: RpcRequest<IRpcGetUserByIdPayload> = {
    source: RpcSource.POST,
    action: RpcAction.USER_RPC_GET_USER_BY_ID,
    payload: {
      _id: user,
      select: select,
    },
  };
  const response = await RabbitMQ.instance.requestData<T>(
    RpcQueueName.RPC_USER,
    rpcUserRequest
  );
  if (response == null || response.data == null) return null;
  return response.data;
};
