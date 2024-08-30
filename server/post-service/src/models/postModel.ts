import { Schema, model, Document, Types } from "mongoose";
import { IngredientSchema } from "./ingredientModel";
import { InstructionSchema } from "./instructionModel";

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
        type: Types.ObjectId,
        required: true,
      }
    ],
  instructions: [
    {
      type: Types.ObjectId,
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
