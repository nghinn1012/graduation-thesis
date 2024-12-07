                                                                                                                                                             import { sendActiveMannualAccount, MannualAccountInfo, UpdateProfileInfo, sendForgotPassword } from "../services/mailService";
import { IBrokerMessage, RabbitMQ } from "./rpc";
import { io } from "../../index";
import { createCommentedFoodNotifications, createFollowNotifications, createLikedFoodNotifications, createMadeFoodNotifications, createNewFoodNotifications, createSavedFoodNotifications, createSendReportNotification, createSendReportUpdateNotification } from "../services/notificationService";
import { PostNotification } from "../data/interface/notification_interface";
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
    FORGOT_PASSWORD: "FORGOT_PASSWORD",
  },
  food: {
    NOTIFY_NEW_FOOD: "NOTIFY_NEW_FOOD",
    NOTIFY_FOOD_UPLOAD_COMPLETE: "NOTIFY_FOOD_UPLOAD_COMPLETE",
    NOTIFY_MADE_UPLOAD_COMPLETE: "NOTIFY_MADE_UPLOAD_COMPLETE",
    NOTIFY_FOOD_LIKED: "NOTIFY_FOOD_LIKED",
    NOTIFY_FOOD_COMMENTED: "NOTIFY_FOOD_COMMENTED",
    NOTIFY_FOOD_SAVED: "NOTIFY_FOOD_SAVED",
    NOTIFY_FOOD_MADE: "NOTIFY_FOOD_MADE",
    NOTIFY_SEND_REPORT: "NOTIFY_SEND_REPORT",
    NOTIFY_SEND_REPORT_UPDATE: "NOTIFY_SEND_REPORT_UPDATE",
  },
  user: {
    NOTIFY_UPLOADS_IMAGE_COMPLETE: "NOTIFY_UPLOADS_IMAGE_COMPLETE",
    NOTIFY_NEW_FOLLOWER: "NOTIFY_NEW_FOLLOWER",
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
  food: {
    _id: string;
    title: string;
    image: string;
  },
  author: string,
  mentions: string
}

export interface IRpcGetAuthorsPayload {
  _ids: string[];
  select?: string | string[];
}

export interface IBrokerNotifyNewFollowerPayload {
  user: string;
  follower: IAuthor;
}

export interface IBrokerNotifySendReportPayload {
  user: IAuthor;
  post: PostNotification;
}

export interface IBrokerNotifySendReportUpdatePayload {
  user: IAuthor;
  food: PostNotification;
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
    brokerOperations.mail.FORGOT_PASSWORD,
    (msg: IBrokerMessage<MannualAccountInfo>) => {
      sendForgotPassword(msg.data.email, msg.data.token);
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
    brokerOperations.food.NOTIFY_MADE_UPLOAD_COMPLETE,
    (msg: IBrokerMessage<NotifiFoodUploadResponse>) => {
      io.emit(msg.data.type, msg.data._id);
    }
  )

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

  rabbit.listenMessage(
    brokerOperations.food.NOTIFY_FOOD_COMMENTED,
    (msg: IBrokerMessage<IBrokerNotifyCommentedFoodPayload>) => {
      const { user, food, author, mentions } = msg.data;
      console.log("Message data:", user, food, author, mentions);
      createCommentedFoodNotifications(user, food, author, mentions);
    }
  );

  rabbit.listenMessage(
    brokerOperations.food.NOTIFY_FOOD_SAVED,
    (msg: IBrokerMessage<IBrokerNotifyLikedFoodPayload>) => {
      const { food, user, authorId } = msg.data;
      createSavedFoodNotifications(user, food, authorId);
    }
  );

  rabbit.listenMessage(
    brokerOperations.food.NOTIFY_FOOD_MADE,
    (msg: IBrokerMessage<IBrokerNotifyLikedFoodPayload>) => {
      const { food, user, authorId } = msg.data;
      console.log("Message data:", food, user, authorId);
      createMadeFoodNotifications(user, food, authorId);
    }
  );

  rabbit.listenMessage(
    brokerOperations.user.NOTIFY_NEW_FOLLOWER,
    (msg: IBrokerMessage<IBrokerNotifyNewFollowerPayload>) => {
      console.log("Message data:", msg.data);
      const { user, follower } = msg.data;
      createFollowNotifications(user, follower);
    }
  );

  rabbit.listenMessage(
    brokerOperations.food.NOTIFY_SEND_REPORT,
    (msg: IBrokerMessage<IBrokerNotifySendReportPayload>) => {
      console.log("Message data:", msg.data);
      const { user, post } = msg.data;
      createSendReportNotification(user, post);
    }
  );

  rabbit.listenMessage(
    brokerOperations.food.NOTIFY_SEND_REPORT_UPDATE,
    (msg: IBrokerMessage<IBrokerNotifySendReportUpdatePayload>) => {
      console.log("Message data:", msg.data);
      const { user, food } = msg.data;
      createSendReportUpdateNotification(user, food);
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
