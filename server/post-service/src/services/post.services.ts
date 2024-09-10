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
    if (data.instructions) {
      data.instructions = autoAssignSteps(data.instructions);
    }
    const post = await postModel.create({
      ...data,
    });

    if (data.images) {
      const uploadImages = async (imageUrls: string[]) => {
        const limit = 5;
        const chunks = [];
        for (let i = 0; i < imageUrls.length; i += limit) {
          chunks.push(imageUrls.slice(i, i + limit));
        }

        try {
          const uploadedImages = await Promise.all(chunks.map(chunk =>
            Promise.all(chunk.map(async (image) => {
              try {
                return await uploadImageToCloudinary(image);
              } catch (error) {
                console.error(`Error uploading image: }`, error);
                throw new Error(`Failed to upload image:`);
              }
            }))
          )).then(results => results.flat());

          await postModel.updateOne(
            { _id: post._id },
            { $set: { images: uploadedImages } }
          );
        } catch (error) {
          console.error("Error uploading images chunk:", error);
        }
      };
      uploadImages(data.images);
    }

    if (data.instructions) {
      const uploadInstructionsImages = async () => {
        try {
          const updatedInstructions = await Promise.all(
            data.instructions.map(async (instruction) => {
              if (instruction.image) {
                try {
                  const uploadedImage = await uploadImageToCloudinary(instruction.image);
                  return {
                    ...instruction,
                    image: uploadedImage,
                  };
                } catch (error) {
                  console.error(`Error uploading instruction image: `, error);
                  throw new Error(`Failed to upload instruction image: `);
                }
              }
              return instruction;
            })
          );

          await postModel.updateOne(
            { _id: post._id },
            { $set: { instructions: updatedInstructions } }
          );
        } catch (error) {
          console.error("Error uploading instruction images:", error);
        }
      };

      uploadInstructionsImages();
    }

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
    console.log(post.author.toString(), userId);
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
    console.log(postUpdate);
    return postUpdate;

  } catch (error) {
    throw new InternalError({
      data: {
        target: "post-food",
        reason: error as string,
      },
    });
  }
}

export const getAllPostsService = async () => {
  try {
    const posts = await postModel.find().sort({ createdAt: -1 });
    return posts;
  } catch (error) {
    throw new InternalError({
      data: {
        target: "post-food",
        reason: (error as Error).message,
      },
    });
  }
}
