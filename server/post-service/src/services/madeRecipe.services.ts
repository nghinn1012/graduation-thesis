import { IMadeRecipe } from "../data/interface/made_recipe_interface";
import MadeRecipeModel from "../models/madeRepiceModel";
import { deleteImageFromCloudinary, extractPublicIdFromUrl, uploadImageToCloudinary } from "./imagesuploader.services";
import { IAuthor, rpcGetUser, rpcGetUsers } from "./rpc.services";
import { io } from '../../index';
import postModel from "../models/postModel";
import { notifyMadeFood } from "./notify.services";
import { brokerOperations, BrokerSource, RabbitMQ } from "../broker";
export const createMadeRecipeService = async (madeRecipeData: IMadeRecipe) => {
  if (!madeRecipeData.userId) {
    throw new Error("User not found");
  }
  const user = await rpcGetUser<IAuthor>(madeRecipeData.userId, ["_id", "name", "avatar", "username"]);
  if (!user) {
    throw new Error("User not found");
  }
  try {
    const madeRecipe = await MadeRecipeModel.create({
      ...madeRecipeData,
      image: "Test image",
    });

    const handleImageUpload = async () => {
      if (madeRecipeData.image) {
        try {
          const imageUrl = await uploadImageToCloudinary(madeRecipeData.image, "mades");
          if (imageUrl) {
            madeRecipe.image = imageUrl;
            await madeRecipe.save();
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
      RabbitMQ.instance.publicMessage(
        BrokerSource.NOTIFICATION,
        brokerOperations.food.NOTIFY_MADE_UPLOAD_COMPLETE,
        {
          _id: madeRecipe._id,
          type: "made-create",
        }
      );
    };

    handleImageUpload();
    const ratingOfPost = await MadeRecipeModel.find({ postId: madeRecipe.postId }).select("rating");
    let totalRating = 0;
    ratingOfPost.forEach((rating) => {
      totalRating += rating.rating;
    });
    console.log("ratingOfPost", totalRating);
    const rating = totalRating / ratingOfPost.length;
    const post = await postModel.findByIdAndUpdate(madeRecipe.postId, { averageRating: rating });
    if (!post) {
      throw new Error("Post not found");
    }
    await notifyMadeFood(user, {
      _id: post._id.toString(),
      title: post.title,
      image: post.images[0],
    }, post.author);
    return madeRecipe;
  } catch (error) {
    console.error("Error in createMadeRecipeService:", error);
    throw error;
  }
};

export const getMadeRecipeOfPostService = async (postId: string) => {
  try {
    const madeRecipes = await MadeRecipeModel.find({ postId }).sort({ createdAt: -1 });
    const authors = await rpcGetUsers<IAuthor[]>(madeRecipes.map(madeRecipe => madeRecipe.userId), ["_id", "email", "name", "avatar", "username"]);

    const madesWithAuthors = madeRecipes.map((madeRecipe, index) => ({
      ...madeRecipe.toObject(),
      author: authors ? authors[index] : null,
    }));

    return madesWithAuthors;
  } catch (error) {
    throw error;
  }
}

export const updateMadeRecipeService = async (madeRecipeId: string, madeRecipeData: IMadeRecipe) => {
  try {
    console.log("madeRecipeData", madeRecipeId);
    const madeRecipe = await MadeRecipeModel.findById(madeRecipeId);
    if (!madeRecipe) {
      throw new Error("Made recipe not found");
    }
    const updateData = madeRecipeData.image ? { ...madeRecipeData, image: "Test image" } : madeRecipeData;
    madeRecipe.set(updateData);
    await madeRecipe.save();

    const handleImageUpload = async () => {
      if (madeRecipeData.image) {
        try {
          const imageUrl = await uploadImageToCloudinary(madeRecipeData.image, "mades");
          if (imageUrl) {
            madeRecipe.image = imageUrl;
            await madeRecipe.save();
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
      RabbitMQ.instance.publicMessage(
        BrokerSource.NOTIFICATION,
        brokerOperations.food.NOTIFY_MADE_UPLOAD_COMPLETE,
        {
          _id: madeRecipeId,
          type: "made-update",
        }
      );
    };

    handleImageUpload();
    const ratingOfPost = await MadeRecipeModel.find({ postId: madeRecipe.postId }).select("rating");
    let totalRating = 0;
    ratingOfPost.forEach((rating) => {
      totalRating += rating.rating;
    });
    const rating = totalRating / ratingOfPost.length;
    await postModel.findByIdAndUpdate(madeRecipe.postId, { averageRating: rating });

    return madeRecipe;
  } catch (error) {
    throw error;
  }
}

export const getMadeRecipeByIdService = async (madeRecipeId: string) => {
  try {
    const madeRecipe = await MadeRecipeModel.findById(madeRecipeId);
    if (!madeRecipe) {
      throw new Error("Made recipe not found");
    }
    return madeRecipe;
  } catch (error) {
    throw error;
  }
}

export const deleteMadeRecipeService = async (madeRecipeId: string) => {
  try {
    const madeRecipe = await MadeRecipeModel.findByIdAndDelete(madeRecipeId);
    if (!madeRecipe) {
      throw new Error("Made recipe not found");
    }

    setImmediate(async () => {
      try {
        const publicId = extractPublicIdFromUrl(madeRecipe.image);
        await deleteImageFromCloudinary(publicId);
      } catch (error) {
        console.error(`Error deleting image:`, error);
      }
    });

    const ratingOfPost = await MadeRecipeModel.find({ postId: madeRecipe.postId }).select("rating");
    let totalRating = 0;
    ratingOfPost.forEach((rating) => {
      totalRating += rating.rating;
    });
    const rating = totalRating / ratingOfPost.length as number;
    console.log("ratingOfPost", rating);
    await postModel.findByIdAndUpdate(madeRecipe.postId, { averageRating: rating || 0 });

    return madeRecipe;
  } catch (error) {
    throw error;
  }
}
