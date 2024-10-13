import { sendActiveMannualAccount, MannualAccountInfo, UpdateProfileInfo } from "../services/mailService";
import { IBrokerMessage, RabbitMQ } from "./rpc";
import { io } from "../../index";
import { createLikedFoodNotifications, createNewFoodNotifications } from "../services/notificationService";
export interface Ided {
  _id: string;
}

export const RpcAction = {
  USER_RPC_GET_INFO: "rpcGetUserInfo",
  USER_RPC_GET_USER_BY_ID: "rpcGetUserById",
  USER_RPC_GET_AUTHORS: "rpcGetAuthors",
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
    NOTIFY_FOOD_LIKED: "NOTIFY_FOOD_LIKED",
    NOTIFY_FOOD_COMMENTED: "NOTIFY_FOOD_COMMENTED",
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

export interface IAuthor {
  _id: string;
  name: string;
  username: string;
  avatar: string;
}

export interface NotifiFoodUploadResponse {
  type: string;
  _id: string;
}

export interface IBrokerNotifyLikedFoodPayload {
  user: IAuthor;
  food: {
    _id: string;
    title: string;
    image: string;
  };
  authorId: string;
}

export interface IBrokerNotifyNewFoodPayload {
  food: {
    _id: string;
    title: string;
    image: string;
  };
  followers: string[];
  user: IAuthor;
}

export interface IBrokerNotifyCommentedFoodPayload {
  user: IAuthor,
  parentCommentId: string,
  food: {
    _id: string;
    title: string;
    image: string;
  },
  notiUsers: string[],
}

export interface IRpcGetAuthorsPayload {
  _ids: string[];
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

  rabbit.listenMessage(
    brokerOperations.food.NOTIFY_FOOD_LIKED,
    (msg: IBrokerMessage<IBrokerNotifyLikedFoodPayload>) => {

      if (msg.data) {
        const { food, user, authorId } = msg.data;
        console.log("Message data:", food, user, authorId);
        createLikedFoodNotifications(user, food, authorId);
      } else {
        console.error("Message data is undefined or missing expected properties.");
      }
    }
  );

  rabbit.listenMessage(
    brokerOperations.food.NOTIFY_NEW_FOOD,
    (msg: IBrokerMessage<IBrokerNotifyNewFoodPayload>) => {
      const { user, food, followers } = msg.data;
      console.log("Message data:", user, food, followers);
      createNewFoodNotifications(user, food, followers);
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
