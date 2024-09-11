import postModel from "../models/postModel";
import { rpcGetUser, Id, rpcGetUsers, IAuthor } from "../services/rpc.services";
import { IPost, InternalError, autoAssignSteps } from "../data/index";
import { uploadImageToCloudinary } from "./imagesuploader.services";
import { io } from '../../index';

export const createPostService = async (data: IPost, io: Server) => {
  try {
    // Ensure author exists
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
      images: [],
      instructions: [],
    });

    const uploadImages = async (imageUrls: string[]) => {
      const limit = 5;
      const chunks = [];
      for (let i = 0; i < imageUrls.length; i += limit) {
        chunks.push(imageUrls.slice(i, i + limit));
      }

      try {
        const uploadedImages = await Promise.all(
          chunks.map(chunk =>
            Promise.all(chunk.map(async (image) => {
              try {
                return await uploadImageToCloudinary(image);
              } catch (error) {
                console.error(`Error uploading image:`, error);
                throw new Error(`Failed to upload image`);
              }
            }))
          )
        ).then(results => results.flat());

        await postModel.updateOne(
          { _id: post._id },
          { $set: { images: uploadedImages } }
        );

        // Emit event to notify client of completion
        // io.emit("images-uploaded", { postId: post._id, images: uploadedImages });

      } catch (error) {
        console.error("Error uploading images chunk:", error);
      }
    };

    // Function to upload instruction images
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
                console.error(`Error uploading instruction image:`, error);
                throw new Error(`Failed to upload instruction image`);
              }
            }
            return instruction;
          })
        );

        await postModel.updateOne(
          { _id: post._id },
          { $set: { instructions: updatedInstructions } }
        );

        // Emit event to notify client of completion
        // io.emit("instructions-images-uploaded", { postId: post._id, instructions: updatedInstructions });

      } catch (error) {
        console.error("Error uploading instruction images:", error);
      }
    };

    // Start image uploads
    if (data.images) {
      await uploadImages(data.images);
    }

    if (data.instructions) {
      await uploadInstructionsImages();
    }

    // Notify client after all uploads are done
    io.emit('uploads-complete',  post._id);
    console.log("send done");

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
    console.log(postUpdate);

    if (data.images) {
      const uploadImages = async (imageUrls: string[]) => {
        const limit = 5;
        const chunks = [];
        for (let i = 0; i < imageUrls.length; i += limit) {
          chunks.push(imageUrls.slice(i, i + limit));
        }

        try {
          const uploadedImages = await Promise.all(
            chunks.map(async (chunk) =>
              Promise.all(
                chunk.map(async (image) => {
                  try {
                    return await uploadImageToCloudinary(image);
                  } catch (error) {
                    console.error(`Error uploading image: `, error);
                    throw new Error(`Failed to upload image: ${(error as Error).message}`);
                  }
                })
              )
            )
          ).then(results => results.flat());

          await postModel.updateOne(
            { _id: post._id },
            { $set: { images: uploadedImages } }
          );
        } catch (error) {
          console.error("Error uploading images chunk:", error);
          throw new Error("Failed to update images");
        }
      };

      await uploadImages(data.images);
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
                  console.log(`Error uploading instruction image: `, error);
                  throw new Error(`Failed to upload instruction image: ${(error as Error).message}`);
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
          console.log("Error uploading instruction images:", error);
          throw new Error("Failed to update instruction images");
        }
      };

      await uploadInstructionsImages();
    }

    return postUpdate;
  } catch (error) {
    throw new InternalError({
      data: {
        target: "post-food",
        reason: (error as Error).message,
      },
    });
  }
};

export const getAllPostsService = async () => {
  try {
    const posts = await postModel.find().sort({ createdAt: -1 }).limit(10);

    const authors = await rpcGetUsers<IAuthor[]>(posts.map(post => post.author), ["_id", "email", "name", "avatar", "username"]);

    const postsWithAuthors = posts.map((post, index) => ({
      ...post.toObject(),
      author: authors ? authors[index] : null,
    }));

    return postsWithAuthors;
  } catch (error) {
    throw new InternalError({
      data: {
        target: "post-food",
        reason: (error as Error).message,
      },
    });
  }
}
