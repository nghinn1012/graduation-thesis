import mongoose, { model, Schema } from "mongoose";

export const ingredientOfListSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  checked: { type: Boolean, default: false }
});

const postSchema = new Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  servings: { type: Number, required: true },
  ingredients: [ingredientOfListSchema]
});

const shoppingListSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  posts: [postSchema],
  standaloneIngredients: {
    type: [ingredientOfListSchema],
    default: [],
  },
});

const ShoppingListModel = model("ShoppingList", shoppingListSchema);
export default ShoppingListModel;
