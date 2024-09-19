import { AuthRequest } from "../data";
import { Response } from "express";
import { addIngredientToShoppingListService, getShoppingListService } from "../services/shoppingList.service";

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
