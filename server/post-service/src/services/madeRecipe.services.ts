import { IMadeRecipe } from "../data/interface/made_recipe_interface";
import MadeRecipeModel from "../models/madeRepiceModel";
import { deleteImageFromCloudinary, extractPublicIdFromUrl, uploadImageToCloudinary } from "./imagesuploader.services";
import { IAuthor, rpcGetUsers } from "./rpc.services";
import { io } from '../../index';
export const createMadeRecipeService = async (madeRecipeData: IMadeRecipe) => {
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
    };

    handleImageUpload();

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
      io.emit('made-update', madeRecipeId);
    };

    handleImageUpload();

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

    return madeRecipe;
  } catch (error) {
    throw error;
  }
}
