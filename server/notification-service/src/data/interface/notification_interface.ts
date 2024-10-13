import { IAuthor } from "../../broker/rpc_consumer";
export interface PostNotification {
  _id: string;
  title: string;
  image: string;
}

export interface NotificationInfo {
  _id?: string,
  users: string[],
  message: string,
  type: "FOOD_LIKED" | "NEW_FOOD" | "FOOD_UPLOAD_COMPLETE" |
  "FOOD_COMMENTED" | "FOOD_SAVED" | "FOOD_MADE" | "NEW_FOLLOWER",
  link?: string,
  reads: string[],
  author: string,
  post?: PostNotification,
  createdAt?: Date,
}

export interface NotificationToUser {
  _id?: string,
  message: string,
  type: "FOOD_LIKED" | "NEW_FOOD" |
  "FOOD_UPLOAD_COMPLETE" | "FOOD_COMMENTED"
  | "FOOD_SAVED" | "FOOD_MADE" | "NEW_FOLLOWER",
  read: boolean,
  link?: string,
  author?: IAuthor,
  post?: PostNotification,
  createdAt?: Date,
}
