import { AuthRequest } from "../data";
import { Response } from "express";
import { createMadeRecipeService, getMadeRecipeByIdService, getMadeRecipeOfPostService, updateMadeRecipeService } from "../services/madeRecipe.services";

export const createMadeRecipeController = async (req: AuthRequest, res: Response) => {
  try {
    const madeRecipeData = {
      ...req.body,
      postId: req.params.id,
      userId: req.authContent?.data.userId
    };
    const madeRecipe = await createMadeRecipeService(madeRecipeData);
    if (!madeRecipe) {
      return res.status(400).json({
        message: "Cannot create made recipe"
      });
    }
    return res.status(200).json(madeRecipe);
  } catch (error) {
    return res.status(400).json({
      message: "Cannot create made recipe",
      error: (error as Error).message
    });
  }
}

export const getMadeRecipeOfPostController = async (req: AuthRequest, res: Response) => {
  try {
    const madeRecipes = await getMadeRecipeOfPostService(req.params.id);
    if (!madeRecipes) {
      return res.status(400).json({
        message: "Cannot get made recipes"
      });
    }
    return res.status(200).json(madeRecipes);
  } catch (error) {
    return res.status(400).json({
      message: "Cannot get made recipes",
      error: (error as Error).message
    });
  }
}

export const updateMadeRecipeController = async (req: AuthRequest, res: Response) => {
  try {
    const madeRecipeId = req.params.madeRecipeId;
    const madeRecipeData = req.body;
    const madeRecipe = await updateMadeRecipeService(madeRecipeId, madeRecipeData);
    if (!madeRecipe) {
      return res.status(400).json({
        message: "Cannot update made recipe"
      });
    }
    return res.status(200).json(madeRecipe);
  } catch (error) {
    return res.status(400).json({
      message: "Cannot update made recipe internal error",
      error: (error as Error).message
    });
  }
}

export const getMadeRecipeByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const madeRecipe = await getMadeRecipeByIdService(req.params.madeRecipeId);
    if (!madeRecipe) {
      return res.status(400).json({
        message: "Cannot get made recipe"
      });
    }
    return res.status(200).json(madeRecipe);
  } catch (error) {
    return res.status(400).json({
      message: "Cannot get made recipe internal error",
      error: (error as Error).message
    });
  }
}
