import postModel from "../models/postModel";
import { rpcGetUser, Id } from "../services/rpc.services";
import { IPost, InternalError, autoAssignSteps } from "../data/index";
import { uploadImageToCloudinary } from "./imagesuploader.services";

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

    if (data.images) {
      const uploadedImages = await Promise.all(
        data.images.map((image) => uploadImageToCloudinary(image))
      );
      data.images = uploadedImages;
    }

    if (data.instructions) {
      data.instructions = await Promise.all(
        data.instructions.map(async (instruction) => {
          if (instruction.image) {
            const uploadedImage = await uploadImageToCloudinary(
              instruction.image
            );
            return {
              ...instruction,
              image: uploadedImage,
            };
          }
          return instruction;
        })
      );
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
