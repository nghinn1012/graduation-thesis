import { brokerOperations, BrokerSource, RabbitMQ } from "../broker";
import { IAuthor } from "./rpc.services";

export const notifyLikedFood = async (user: IAuthor, foodId: string, authorId: string) => {
  RabbitMQ.instance.publicMessage(
    BrokerSource.NOTIFICATION,
    brokerOperations.food.NOTIFY_FOOD_LIKED,
    {
      user: user,
      foodId: foodId,
      authorId: authorId,
    }
  );
};
