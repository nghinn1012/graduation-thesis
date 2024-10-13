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
