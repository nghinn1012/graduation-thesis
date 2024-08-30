import { HydratedDocument } from "mongoose";
import postModel from "../models/postModel";
import { rpcGetUser, Id } from "../services/rpc.services";

export interface IFoodPost {
  user: string;
  images: string[];
  title: string;
}

export interface IPostFoodResponse {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const toFoodPostResponse = (data: IPostFoodResponse)=> {
  return {
    _id: data._id.toString(),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};


export const postFood = async (
  data: IFoodPost
): Promise<IPostFoodResponse> => {
  // Check user and place existed
  const user = await Promise.all([
    rpcGetUser<Id>(data.user, "_id"),
  ]);
  console.log(user);
  // if (user == null) {
  //   throw new InternalError({
  //     data: {
  //       target: "rpc-user",
  //       reason: "unknown",
  //     },
  //   });
  // }
  // if (data.place != null && place == null) {
  //   throw new InternalError({
  //     data: {
  //       target: "rpc-user",
  //       reason: "unknown",
  //     },
  //   });
  // }

  // await foodPost.save();
  return toFoodPostResponse({
    _id: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};
