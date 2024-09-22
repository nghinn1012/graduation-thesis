import { AuthRequest } from "../data";
import { addMealService, checkPostInUnscheduledMealService, getMealPlannerService, removeMealService } from "../services/mealPlanner.services";
import { Response } from "express";

export const addMealController = async (req: AuthRequest, res: Response) => {
  try {
    const meal = req.body;
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(401).json(
        {
          message: "Unauthorized",
          error: "User not found",
        }
      );
    }
    const mealPlanner = await addMealService(meal, userId);
    res.status(201).json(mealPlanner);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
}

export const checkPostInUnscheduledMealController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.authContent?.data.userId;
    const postId = req.params.postId;
    if (!userId) {
      return res.status(401).json(
        {
          message: "Unauthorized",
          error: "User not found",
        }
      );
    }
    const unscheduledMeal = await checkPostInUnscheduledMealService(userId, postId);
    res.status(200).json(unscheduledMeal);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
}

export const getMealPlannerController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(401).json(
        {
          message: "Unauthorized",
          error: "User not found",
        }
      );
    }
    const mealPlanner = await getMealPlannerService(userId);
    res.status(200).json(mealPlanner);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
}

export const removeMealController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.authContent?.data.userId;
    const mealId = req.body.mealId;
    const postId = req.body.postId;
    if (!userId) {
      return res.status(401).json(
        {
          message: "Unauthorized",
          error: "User not found",
        }
      );
    }
    const mealPlanner = await removeMealService(userId, mealId, postId);
    res.status(200).json(mealPlanner);
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
}
