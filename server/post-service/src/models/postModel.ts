import { hash } from "crypto";
import { Schema, model, Document } from "mongoose";
import IngredientModel from "./ingredientModel";
import InstructionModel from "./instructionModel";

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    index: true
  },
  images: {
    type: [String],
    required: true,
  },
  hashtags: {
    type: [String],
    required: true
  },
  timeToTake: {
    type: Number,
    required: true
  },
  servings: {
    type: Number,
    required: true
  },
  ingredients: [
    {
      type: IngredientModel,
      required: true,
    }
  ],
  instructions: [
    {
      type: InstructionModel,
      required: true,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const postModel = model("Post", postSchema);
export default postModel;
