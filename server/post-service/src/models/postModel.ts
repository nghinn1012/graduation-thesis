import { Schema, model, Document, Types } from "mongoose";

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  about: {
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
  ingredients: [{
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    }
  }],
  instructions: [{
    step: {
      type: Number,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  }],
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
