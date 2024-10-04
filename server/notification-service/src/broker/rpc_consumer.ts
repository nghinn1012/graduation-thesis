import { NotifiFoodUploadResponse } from "../services/foodService";
import { sendActiveMannualAccount, MannualAccountInfo, UpdateProfileInfo } from "../services/mailService";
import { IBrokerMessage, RabbitMQ } from "./rpc";
import { io } from "../../index";
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
    NOTIFY_FOOD_UPLOAD_COMPLETE: "NOTIFY_FOOD_UPLOAD_COMPLETE",
  },
  user: {
    NOTIFY_UPLOADS_IMAGE_COMPLETE: "NOTIFY_UPLOADS_IMAGE_COMPLETE",
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

  rabbit.listenMessage(
    brokerOperations.food.NOTIFY_FOOD_UPLOAD_COMPLETE,
    (msg: IBrokerMessage<NotifiFoodUploadResponse>) => {
      io.emit(msg.data.type, msg.data._id);
    }
  );

  rabbit.listenMessage(
    brokerOperations.user.NOTIFY_UPLOADS_IMAGE_COMPLETE,
    (msg: IBrokerMessage<UpdateProfileInfo>) => {
      io.emit(msg.data.type, msg.data._id);
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
