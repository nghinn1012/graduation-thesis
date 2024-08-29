import { sendActiveMannualAccount, MannualAccountInfo } from "../services/mailService";
import { IBrokerMessage, RabbitMQ } from "./rpc";

export interface Ided {
  _id: string;
}

export const RpcAction = {
  USER_RPC_GET_INFO: "rpcGetUserInfo",
  USER_RPC_GET_USER_BY_ID: "rpcGetUserById",
} as const;

export type RpcAction = (typeof RpcAction)[keyof typeof RpcAction];

export const brokerOperations = {
  mail: {
    ACTIVE_MANUAL_ACCOUNT: "ACTIVE_MANUAL_ACCOUNT",
    NEW_ACCOUNT_CREATED: "NEW_ACCOUNT_CREATED",
  },
  food: {
    NOTIFY_NEW_FOOD: "NOTIFY_NEW_FOOD",
  },
} as const;

export interface IRpcGetInfoPayLoad {
  _id: string;
}

export interface IRpcGetUserByIdPayload {
  _id: string;
  select?: string | string[];
}

export const initRpcConsumers = (_rabbit: RabbitMQ): void => {
  // Do nothing
};

export const initBrokerConsumners = (rabbit: RabbitMQ): void => {
  rabbit.listenMessage(
    brokerOperations.mail.ACTIVE_MANUAL_ACCOUNT,
    (msg: IBrokerMessage<MannualAccountInfo>) => {
      sendActiveMannualAccount(msg.data);
    }
  );

  // rabbit.listenMessage(
  //   brokerOperations.mail.NEW_ACCOUNT_CREATED,
  //   (msg: IBrokerMessage<NewAccountInfo>) => {
  //     sendNewAccountCreated(msg.data);
  //   }
  // );

  // rabbit.listenMessage(
  //   brokerOperations.food.NOTIFY_NEW_FOOD,
  //   (msg: IBrokerMessage<IBrokerNotifyNewFoodPayload>) => {
  //     const { food, subcribers } = msg.data;
  //     createNewFoodNotifications(food, subcribers);
  //   }
  // );
};
