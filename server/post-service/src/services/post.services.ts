import postModel from "../models/postModel";
import { rpcGetUser, Id, rpcGetUsers, IAuthor, uploadImageToCloudinary } from "./index.services";
import { IPost, InternalError, autoAssignSteps } from "../data/index";
import { io } from '../../index';
import { deleteImageFromCloudinary, extractPublicIdFromUrl } from "./imagesuploader.services";
import { PostSearchBuilder } from "../data/interface/queryBuilder";

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
      images: [],
      instructions: [],
    });

    const handleUploads = async () => {
      try {
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
                    return await uploadImageToCloudinary(image, "posts");
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
          } catch (error) {
            console.error("Error uploading images chunk:", error);
          }
        };

        const uploadInstructionsImages = async () => {
          try {
            const updatedInstructions = await Promise.all(
              data.instructions.map(async (instruction) => {
                if (instruction.image) {
                  try {
                    const uploadedImage = await uploadImageToCloudinary(instruction.image, "posts");
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
          } catch (error) {
            console.error("Error uploading instruction images:", error);
          }
        };

        if (data.images) {
          await uploadImages(data.images);
        }

        if (data.instructions) {
          await uploadInstructionsImages();
        }

        io.emit('uploads-complete', post._id);
      } catch (error) {
        console.error("Error handling uploads:", error);
      }
    };

    handleUploads();

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

export const getAllPostsService = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const posts = await postModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

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

    const postUpdateData: Partial<IPost> = { ...data };
    const oldImages = post.images;

    if (data.images) {
      postUpdateData.images = [];
    }
    if (data.instructions) {
      postUpdateData.instructions = data.instructions.map(instr => ({
        ...instr,
        image: undefined,
      }));
    }

    const postUpdate = await postModel.findByIdAndUpdate(postId, postUpdateData, {
      new: true,
      runValidators: true,
    });

    const handleUploads = async () => {
      try {
        const deleteOldImages = async () => {
          try {
            await Promise.all(oldImages.map(async (imageUrl) => {
              const publicId = extractPublicIdFromUrl(imageUrl);
              try {
                await deleteImageFromCloudinary(publicId);
              } catch (error) {
                console.error(`Error deleting old image:`, error);
                throw new Error(`Failed to delete old image`);
              }
            }));
          } catch (error) {
            console.error("Error deleting old images:", error);
          }
        };

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
                    return await uploadImageToCloudinary(image, "posts");
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
          } catch (error) {
            console.error("Error uploading images chunk:", error);
          }
        };

        const uploadInstructionsImages = async () => {
          try {
            const updatedInstructions = await Promise.all(
              data.instructions.map(async (instruction) => {
                if (instruction.image) {
                  try {
                    const uploadedImage = await uploadImageToCloudinary(instruction.image, "posts");
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
          } catch (error) {
            console.error("Error uploading instruction images:", error);
          }
        };

        if (data.images) {
          await uploadImages(data.images);
        }

        if (data.instructions) {
          await uploadInstructionsImages();
        }

        io.emit('images-updated', post._id);

        if (oldImages.length > 0) {
          await deleteOldImages();
        }
      } catch (error) {
        console.error("Error handling uploads:", error);
      }
    };

    handleUploads();

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

export const deletePostService = async (postId: string, userId: string) => {
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
          target: "delete-post",
          reason: "unauthorized",
        },
      });
    }

    const postDelete = await postModel.findByIdAndDelete(postId);

    const handleDeletions = async () => {
      try {
        const deleteImages = async () => {
          try {
            await Promise.all(post.images.map(async (imageUrl) => {
              const publicId = extractPublicIdFromUrl(imageUrl);
              try {
                await deleteImageFromCloudinary(publicId);
              } catch (error) {
                console.error(`Error deleting image:`, error);
                throw new Error(`Failed to delete image`);
              }
            }));
          } catch (error) {
            console.error("Error deleting images:", error);
          }
        };

        const deleteInstructionsImages = async () => {
          try {
            await Promise.all(post.instructions.map(async (instruction) => {
              if (instruction.image) {
                const publicId = extractPublicIdFromUrl(instruction.image);
                try {
                  await deleteImageFromCloudinary(publicId);
                } catch (error) {
                  console.error(`Error deleting instruction image:`, error);
                  throw new Error(`Failed to delete instruction image`);
                }
              }
            }));
          } catch (error) {
            console.error("Error deleting instruction images:", error);
          }
        };

        await deleteImages();
        await deleteInstructionsImages();
      } catch (error) {
        console.error("Error handling deletions:", error);
      }
    };

    handleDeletions();

    return postDelete;
  } catch (error) {
    throw new InternalError({
      data: {
        target: "post-food",
        reason: (error as Error).message,
      },
    });
  }
};

export const searchPostService = async (query: string, pageSize: number, page: number) => {
  const postSearchBuilder = new PostSearchBuilder()
    .search(query)
    .paginate(pageSize, page);

  const pipeline = postSearchBuilder.build();

  const posts = await postModel.aggregate(pipeline);

  const totalPosts = await postModel.countDocuments({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { about: { $regex: query, $options: 'i' } },
      { "ingredients.name": { $regex: query, $options: 'i' } },
      { "instructions.description": { $regex: query, $options: 'i' } },
    ]
  });

  return { posts, total: totalPosts, page, pageSize };
};
