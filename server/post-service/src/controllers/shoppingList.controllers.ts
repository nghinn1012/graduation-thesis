import { AuthRequest } from "../data";
import { Response } from "express";
import { addIngredientToShoppingListService, checkPostInShoppingListService, getShoppingListService, removePostFromShoppingListService } from "../services/shoppingList.service";

export const addIngredientToShoppingListController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Cannot add ingredient to shopping list"
      });
    }
    const postId = req.body.postId;
    const servings = req.body.servings;
    const ingredients = req.body.ingredients;
    const result = await addIngredientToShoppingListService(postId, servings, userId, ingredients);
    return res.status(200).json(result);
  }
  catch (error) {
    return res.status(400).json({
      message: "Cannot add ingredient to shopping list",
      error: (error as Error).message
    });
  }
}

export const getShoppingListController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Cannot get shopping list"
      });
    }
    const result = await getShoppingListService(userId);
    return res.status(200).json(result);
  }
  catch (error) {
    return res.status(400).json({
      message: "Cannot get shopping list",
      error: (error as Error).message
    });
  }
}

export const checkPostInShoppingListController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Cannot check ingredient in shopping list"
      });
    }
    const postId = req.params.postId;
    const result = await checkPostInShoppingListService(userId, postId);
    return res.status(200).json(result);
  }
  catch (error) {
    return res.status(400).json({
      message: "Cannot check ingredient in shopping list",
      error: (error as Error).message
    });
  }
}

export const removePostFromShoppingListController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Cannot remove ingredient from shopping list"
      });
    }
    const postId = req.params.postId;
    const result = await removePostFromShoppingListService(userId, postId);
    return res.status(200).json(result);
  }
  catch (error) {
    return res.status(400).json({
      message: "Cannot remove ingredient from shopping list",
      error: (error as Error).message
    });
  }
}
