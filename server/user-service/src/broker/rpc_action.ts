export const RpcAction = {
  USER_RPC_GET_INFO: "rpcGetUserInfo",
  USER_RPC_GET_USER_BY_ID: "rpcGetUserById",
  USER_RPC_GET_DICT_USER_BY_LIST_ID: "rpcGetDictUserByListId",
  USER_RPC_GET_PLACE_BY_ID: "rpcGetPlaceById",
  USER_RPC_GET_DICT_PLACE_BY_LIST_ID: "rpcGetDictPlaceByListId",
  USER_RPC_GET_REGISTERS_BY_USER_ID: "rpcGetRegistersByUserId",
  USER_RPC_GET_RATED_SCORES_BY_USER_ID: "rpcGetRatedScoresByUserId",
} as const;

export type RpcAction = (typeof RpcAction)[keyof typeof RpcAction];
