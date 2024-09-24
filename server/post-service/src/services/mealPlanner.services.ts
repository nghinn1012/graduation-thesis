import { Meal } from "../data/interface/meal_planner_interface";
import MealPlanner from "../models/mealPlanner";
import postModel from "../models/postModel";

export const addMealService = async (meal: Meal, userId: string) => {
  try {
    const mealPlanner = await MealPlanner.findOne({ userId });
    if (mealPlanner && mealPlanner.meals.some((m) => m.postId.toString() === meal.postId.toString())) {
      throw new Error("Post already added");
    }
    const mealInfo = await postModel.findById(meal.postId);
    if (!mealInfo) {
      throw new Error("Post not found");
    }
    const createMealData = {
      ...meal,
      timeToTake: mealInfo.timeToTake,
      title: mealInfo.title,
      imageUrl: mealInfo.images[0],
    }
    if (!mealPlanner) {
      const newMealPlanner = new MealPlanner({
        userId,
        meals: [createMealData],
      });
      await newMealPlanner.save();
      return newMealPlanner;
    } else {
      mealPlanner.meals.push(createMealData);
      await mealPlanner.save();
      return mealPlanner;
    }
  } catch (error) {
    throw error;
  }
}

export const checkPostInUnscheduledMealService = async (userId: string, postId: string) => {
  try {
    const mealPlanners = await MealPlanner.find({ userId });
    const unscheduledMeal = mealPlanners.filter((mealPlanner) => {
      return mealPlanner.meals.some((meal) => meal.postId.toString() === postId);
    });
    if (unscheduledMeal.length === 0) {
      return false;
    }
    return true;
  } catch (error) {
    throw error;
  }
}

export const getMealPlannerService = async (userId: string) => {
  try {
    const mealPlanner = await MealPlanner.findOne({ userId });
    return mealPlanner;
  } catch (error) {
    throw error;
  }
}

export const removeMealService = async (userId: string, mealId?: string, postId?: string) => {
  try {
    const mealPlanner = await MealPlanner.findOne({ userId });
    if (!mealPlanner) {
      throw new Error("Meal planner not found");
    }
    if (postId) {
      const mealIndex = mealPlanner.meals.findIndex((meal) => meal.postId.toString() === postId);
      if (mealIndex === -1) {
        throw new Error("Post not found");
      }
      mealPlanner.meals.splice(mealIndex, 1);
      await mealPlanner.save();
      return mealPlanner;
    } else {
      const mealIndex = mealPlanner.meals.findIndex((meal) => meal._id.toString() === mealId);
      if (mealIndex === -1) {
        throw new Error("Meal not found");
      }
      mealPlanner.meals.splice(mealIndex, 1);
      await mealPlanner.save();
      return mealPlanner;
    }
  } catch (error) {
    throw error;
  }
}

export const scheduleMealService = async (
  userId: string,
  mealId: string,
  dates: string[]
) => {
  try {
    const mealPlanner = await MealPlanner.findOne({ userId });

    if (!mealPlanner) {
      throw new Error(`Meal planner for user ID ${userId} not found`);
    }

    const mealIndex = mealPlanner.meals.findIndex(
      (meal) => meal._id.toString() === mealId
    );

    if (mealIndex === -1) {
      throw new Error(`Meal with ID ${mealId} not found in the meal planner`);
    }

    mealPlanner.meals[mealIndex].is_planned = true;
    while (mealPlanner.meals[mealIndex].plannedDate.length > 0) {
      mealPlanner.meals[mealIndex].plannedDate.pop();
    }
    if (dates.length === 0) {
      mealPlanner.meals[mealIndex].is_planned = false;
      await mealPlanner.save();
      return mealPlanner;
    }
    mealPlanner.meals[mealIndex].plannedDate.push(...dates);

    await mealPlanner.save();

    return mealPlanner;
  } catch (error) {
    throw new Error(`Failed to schedule meal: ${(error as Error).message}`);
  }
};
