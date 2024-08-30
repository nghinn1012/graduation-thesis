import { Types } from "mongoose";
import postModel from "../models/postModel";
import { rpcGetUser, Id } from "../services/rpc.services";
import IngredientModel from "../models/ingredientModel";
import InstructionModel from "../models/instructionModel";
import { IPost, IIngredient, IInstruction, InternalError } from "../data/index";

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

    const ingredientsData: IIngredient[] = data.ingredients;
    const responseIngredients: Types.ObjectId[] = [];

    for (const ingredient of ingredientsData) {
      if (!ingredient || !ingredient.name || !ingredient.quantity) {
        throw new InternalError({
          data: {
            target: "ingredients",
            reason: "invalid-ingredient",
          },
        });
      }

      const ingredientData = await IngredientModel.create({
        name: ingredient.name,
        quantity: ingredient.quantity,
      });

      responseIngredients.push(ingredientData._id);
    }

    const instructionsData: IInstruction[] = data.instructions;
    const responseInstructions: Types.ObjectId[] = [];

    for (const instruction of instructionsData) {
      if (!instruction || !instruction.step || !instruction.description) {
        throw new InternalError({
          data: {
            target: "instructions",
            reason: "invalid-instruction",
          },
        });
      }

      const instructionData = await InstructionModel.create({
        step: instruction.step,
        description: instruction.description,
      });

      responseInstructions.push(instructionData._id);
    }

    const post = await postModel.create({
      author: data.author,
      images: data.images,
      title: data.title,
      hashtags: data.hashtags,
      timeToTake: data.timeToTake,
      servings: data.servings,
      ingredients: responseIngredients,
      instructions: responseInstructions,
    });

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
