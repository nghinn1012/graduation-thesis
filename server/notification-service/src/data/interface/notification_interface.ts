import { IAuthor } from "../../broker/rpc_consumer";

export interface NotificationInfo {
  users: string[],
  message: string,
  type: "FOOD_LIKED" | "NEW_FOOD" | "FOOD_UPLOAD_COMPLETE",
  link?: string,
  reads: string[],
  author: IAuthor,
  postId: string,
}

export interface NotificationToUser {
  message: string,
  type: "FOOD_LIKED" | "NEW_FOOD" | "FOOD_UPLOAD_COMPLETE",
  read: boolean,
  link?: string,
  author?: IAuthor,
  postId: string,
}
