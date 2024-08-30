import { Types } from "mongoose";
import postModel from "../models/postModel";
import { rpcGetUser, Id } from "../services/rpc.services";
import { IPost, InternalError, autoAssignSteps } from "../data/index";

export const createPostService = async (data: IPost) => {
  try {
    const author = await rpcGetUser<Id>(data.author, "_id");
    if (!author) {
      console.log("rpc-author", "unknown");
      throw new InternalError({
        data: {
          target: "rpc-author",
          reason: "unknown",
        },
      });
    }
    data.instructions = autoAssignSteps(data.instructions);

    const post = await postModel.create({
      ...data,
    });

    return post;

  } catch (error) {
    throw new InternalError({
      data: {
        target: "post-food",
        reason: (error as Error).message,
      },
    });
  }
};

export const getPostService = async (postId: string) => {
  try {
    const post = await postModel.findById(postId);
    return post;
  } catch (error) {
    throw new InternalError({
      data: {
        target: "post-food",
        reason: (error as Error).message,
      },
    });
  }
}

export const updatePostService = async (postId: string, data: IPost, userId: string) => {
  try {
    const post = await postModel.findById(postId);
    if (!post) {
      throw new InternalError({
        data: {
          target: "post-food",
          reason: "not found",
        },
      });
    }
    if (post.author.toString() !== userId) {
      throw new InternalError({
        data: {
          target: "update-post",
          reason: "unauthorized",
        },
      });
    }
    if (data.instructions) {
      data.instructions = autoAssignSteps(data.instructions);
    }
    const postUpdate = await postModel.findByIdAndUpdate(postId, data, {
      new: true,
      runValidators: true,
    });
    return postUpdate;

  } catch (error) {
    throw new InternalError({
      data: {
        target: "post-food",
        reason: (error as Error).message,
      },
    });
  }
}
