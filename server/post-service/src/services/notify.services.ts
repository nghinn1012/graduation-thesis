import { brokerOperations, BrokerSource, RabbitMQ } from "../broker";
import { IPostNotification } from "../data/interface/post_create_interface";
import { IAuthor } from "./rpc.services";

export const notifyLikedFood = async (user: IAuthor, food: IPostNotification, authorId: string) => {
  RabbitMQ.instance.publicMessage(
    BrokerSource.NOTIFICATION,
    brokerOperations.food.NOTIFY_FOOD_LIKED,
    {
      user: user,
      food: food,
      authorId: authorId,
    }
  );
};

export const notifySavedFood = async (user: IAuthor, food: IPostNotification, authorId: string) => {
  RabbitMQ.instance.publicMessage(
    BrokerSource.NOTIFICATION,
    brokerOperations.food.NOTIFY_FOOD_SAVED,
    {
      user: user,
      food: food,
      authorId: authorId,
    }
  );
}

export const notifyMadeFood = async (user: IAuthor, food: IPostNotification, authorId: string) => {
  RabbitMQ.instance.publicMessage(
    BrokerSource.NOTIFICATION,
    brokerOperations.food.NOTIFY_FOOD_MADE,
    {
      user: user,
      food: food,
      authorId: authorId,
    }
  );
}

export const notifyNewFood = async (user: IAuthor, food: IPostNotification, followers: string[]) => {
  RabbitMQ.instance.publicMessage(
    BrokerSource.NOTIFICATION,
    brokerOperations.food.NOTIFY_NEW_FOOD,
    {
      user: user,
      food: food,
      followers: followers,
    }
  );
};

export const notifyCommentedFood = async (user: IAuthor, food:
  IPostNotification, author: string, mentions: string[]) => {
  RabbitMQ.instance.publicMessage(
    BrokerSource.NOTIFICATION,
    brokerOperations.food.NOTIFY_FOOD_COMMENTED,
    {
      user: user,
      food: food,
      author: author,
      mentions: mentions,
    }
  );
}

export const notifySendReport = async (user: IAuthor, food: IPostNotification) => {
  RabbitMQ.instance.publicMessage(
    BrokerSource.NOTIFICATION,
    brokerOperations.food.NOTIFY_SEND_REPORT,
    {
      user: user,
      food: food,
    }
  );
}

export const notifySendReportCountUpdate = async (user: string) => {
  RabbitMQ.instance.publicMessage(
    BrokerSource.USER,
    brokerOperations.user.USER_UPDATE_REPORT_COUNT,
    {
      user: user,
    }
  );
}
