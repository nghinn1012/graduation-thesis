import { Schema, model, Document, Types } from "mongoose";

const cartSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  products: {
    type: [
      {
        productId: {
          type: Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    default: [],
  },
});

const cartModel = model("Cart", cartSchema);
export default cartModel;
