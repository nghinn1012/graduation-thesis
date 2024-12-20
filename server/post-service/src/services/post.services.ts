import postModel from "../models/postModel";
import {
  rpcGetUser,
  Id,
  rpcGetUsers,
  IAuthor,
  uploadImageToCloudinary,
} from "./index.services";
import { IPost, InternalError, autoAssignSteps } from "../data/index";
import { io } from "../../index";
import {
  deleteImageFromCloudinary,
  extractPublicIdFromUrl,
} from "./imagesuploader.services";
import { PostSearchBuilder } from "../data/interface/queryBuilder";
import { brokerOperations, BrokerSource, RabbitMQ } from "../broker";
import { notifyNewFood } from "./notify.services";
import { AccountInfo, IProduct } from "../data/interface/post_create_interface";
import productModel from "../models/productModel";
import postLikeModel from "../models/postLikeModel";
import CommentModel from "../models/commentModel";

export const createPostService = async (
  data: IPost,
  productData?: IProduct
) => {
  try {
    const author = await rpcGetUser<AccountInfo>(data.author, [
      "_id",
      "name",
      "avatar",
      "username",
      "followers",
    ]);
    if (!author) {
      console.log("rpc-author", "unknown create post");
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

    const product = productData
      ? await productModel.create({
          ...productData,
          postId: post._id,
        })
      : null;
    console.log("product", product);
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
              chunks.map((chunk) =>
                Promise.all(
                  chunk.map(async (image) => {
                    try {
                      return await uploadImageToCloudinary(image, "posts");
                    } catch (error) {
                      console.error(`Error uploading image:`, error);
                      throw new Error(`Failed to upload image`);
                    }
                  })
                )
              )
            ).then((results) => results.flat());

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
                    const uploadedImage = await uploadImageToCloudinary(
                      instruction.image,
                      "posts"
                    );
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

        RabbitMQ.instance.publicMessage(
          BrokerSource.NOTIFICATION,
          brokerOperations.food.NOTIFY_FOOD_UPLOAD_COMPLETE,
          {
            _id: post._id,
            type: "food-uploads-complete",
          }
        );
      } catch (error) {
        console.error("Error handling uploads:", error);
      }
    };

    handleUploads();
    await notifyNewFood(
      author,
      {
        _id: post._id.toString(),
        title: post.title,
        image: post.images[0],
      },
      author.followers
    );
    return {
      post,
      product,
    };
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
    const hasProduct = await productModel.findOne({
      postId: postId,
      isDeleted: false,
    });

    if (!post) {
      throw new InternalError({
        data: {
          target: "post-food",
          reason: "not found",
        },
      });
    }

    return {
      ...post.toObject(),
      hasProduct: hasProduct ? true : false,
      product: hasProduct,
    };
  } catch (error) {
    throw new InternalError({
      data: {
        target: "post-food",
        reason: (error as Error).message,
      },
    });
  }
};

export const getAllPostsService = async (
  page: number,
  limit: number,
  userId?: string
) => {
  try {
    const skip = (page - 1) * limit;

    const posts = userId
      ? await postModel
          .find({ author: userId, isDeleted: false })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
      : await postModel
          .find({ isDeleted: false })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);
    const authors = userId
      ? await rpcGetUser<IAuthor[]>(userId, [
          "_id",
          "email",
          "name",
          "avatar",
          "username",
          "following",
          "followers",
          "coverImage",
          "bio",
        ])
      : await rpcGetUsers<IAuthor[]>(
          posts.map((post) => post.author),
          [
            "_id",
            "email",
            "name",
            "avatar",
            "username",
            "following",
            "followers",
          ]
        );

    const postsWithAuthors = userId
      ? {
          posts,
          authors: {
            ...authors,
            postCount: await postModel.countDocuments({
              author: userId,
              isDeleted: false,
            }),
          },
        }
      : posts.map((post, index) => ({
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
};

export const getAllPostsOfUserService = async (
  userId: string,
  page: number,
  limit: number
) => {
  try {
    const skip = (page - 1) * limit;

    const posts = await postModel
      .find({ author: userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const authors = await rpcGetUsers<IAuthor[]>(
      posts.map((post) => post.author),
      [
        "_id",
        "email",
        "name",
        "avatar",
        "username",
        "following",
        "followers",
        "coverImage",
        "bio",
      ]
    );

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
};

export const updatePostService = async (
  postId: string,
  data: IPost,
  userId: string
) => {
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
      postUpdateData.instructions = data.instructions.map((instr) => ({
        ...instr,
        image: undefined,
      }));
    }

    const postUpdate = await postModel.findByIdAndUpdate(
      postId,
      postUpdateData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!postUpdate) {
      throw new InternalError({
        data: {
          target: "post-food",
          reason: "not found",
        },
      });
    }
    let product = await productModel.findOne({
      postId,
    });
    let result = null;
    if (data.hasProduct && data.product) {
      const updateData: any = {};

      if (data.product.price !== null && data.product.price !== undefined) {
        updateData.price = data.product.price;
      }

      if (
        data.product.quantity !== null &&
        data.product.quantity !== undefined
      ) {
        updateData.quantity = data.product.quantity;
      }

      if (
        data.product.timeToPrepare !== null &&
        data.product.timeToPrepare !== undefined
      ) {
        updateData.timeToPrepare = data.product.timeToPrepare;
      }

      console.log("updateData", updateData);
      if (Object.keys(updateData).length > 0) {
        if (product) {
          result = await productModel.updateOne(
            {
              postId,
            },
            {
              $set: updateData,
            }
          );
        } else {
          result = await productModel.create({
            ...data.product,
            postId: post._id,
          });
        }
      }
    } else if (product && data.hasProduct === false) {
      await productModel.findByIdAndUpdate(product._id, {
        isDeleted: true,
        deletedAt: new Date(),
      });
    }

    const handleUploads = async () => {
      try {
        const deleteOldImages = async () => {
          try {
            await Promise.all(
              oldImages.map(async (imageUrl) => {
                const publicId = extractPublicIdFromUrl(imageUrl);
                try {
                  await deleteImageFromCloudinary(publicId);
                } catch (error) {
                  console.error(`Error deleting old image:`, error);
                  throw new Error(`Failed to delete old image`);
                }
              })
            );
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
              chunks.map((chunk) =>
                Promise.all(
                  chunk.map(async (image) => {
                    try {
                      return await uploadImageToCloudinary(image, "posts");
                    } catch (error) {
                      console.error(`Error uploading image:`, error);
                      throw new Error(`Failed to upload image`);
                    }
                  })
                )
              )
            ).then((results) => results.flat());

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
                    const uploadedImage = await uploadImageToCloudinary(
                      instruction.image,
                      "posts"
                    );
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

        RabbitMQ.instance.publicMessage(
          BrokerSource.NOTIFICATION,
          brokerOperations.food.NOTIFY_FOOD_UPLOAD_COMPLETE,
          {
            _id: post._id,
            type: "food-updated-complete",
          }
        );

        // if (oldImages.length > 0) {
        //   await deleteOldImages();
        // }
      } catch (error) {
        console.error("Error handling uploads:", error);
      }
    };

    handleUploads();
    console.log({
      ...postUpdate.toObject(),
      hasProduct: data.hasProduct,
      product: result,
    });
    return {
      ...postUpdate.toObject(),
      hasProduct: data.hasProduct,
      product: result,
    };
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

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    await postLikeModel.updateMany({ postId }, { isDeleted: true });
    await CommentModel.updateMany({ postId }, { isDeleted: true });
    const product = await productModel.findOne({ postId });
    if (product) {
      product.isDeleted = true;
      await product.save();
    }

    const handleDeletions = async () => {
      try {
        const deleteImages = async () => {
          await Promise.all(
            post.images.map(async (imageUrl) => {
              const publicId = extractPublicIdFromUrl(imageUrl);
              try {
                await deleteImageFromCloudinary(publicId);
              } catch (error) {
                console.error(`Error deleting image:`, error);
              }
            })
          );
        };

        const deleteInstructionsImages = async () => {
          await Promise.all(
            post.instructions.map(async (instruction) => {
              if (instruction.image) {
                const publicId = extractPublicIdFromUrl(instruction.image);
                try {
                  await deleteImageFromCloudinary(publicId);
                } catch (error) {
                  console.error(`Error deleting instruction image:`, error);
                }
              }
            })
          );
        };

        await deleteImages();
        await deleteInstructionsImages();
      } catch (error) {
        console.error("Error handling deletions:", error);
      }
    };

    handleDeletions();

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

export const searchPostService = async (
  query: string,
  minTime: string,
  maxTime: string,
  minQuality: number,
  haveMade: boolean,
  difficulty: string[],
  hashtags: string[],
  timeOrder: number,
  quantityOrder: number,
  pageSize: number,
  page: number
) => {
  console.log(
    "searchPostService",
    query,
    minTime,
    maxTime,
    minQuality,
    haveMade,
    difficulty,
    hashtags,
    timeOrder,
    quantityOrder,
    pageSize,
    page
  );
  const postSearchBuilder = new PostSearchBuilder()
    .search(query)
    .filterCookingTime(minTime, maxTime)
    .filterByHavedMade(haveMade)
    .filterQuality(minQuality)
    .filterByHashtags(hashtags)
    .filterByDifficulty(difficulty)
    .sortByTime(Number(timeOrder))
    .sortByQuality(Number(quantityOrder))
    .filterByNotDeleted()
    .paginate(pageSize, page);
  const pipeline = postSearchBuilder.build();
  const posts = await postModel.aggregate(pipeline);

  const totalPosts = await postModel.countDocuments(
    postSearchBuilder.getMatchCriteria()
  );
  const authors = await rpcGetUsers<IAuthor[]>(
    posts.map((post) => post.author),
    ["_id", "email", "name", "avatar", "username"]
  );
  posts.forEach((post, index) => {
    post.author = authors ? authors[index] : null;
  });

  return { posts, total: totalPosts, page, pageSize };
};
