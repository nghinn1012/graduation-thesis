import { model, Schema } from "mongoose";

const IngredientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
});

const IngredientModel = model("Ingredient", IngredientSchema);
export default IngredientModel;
