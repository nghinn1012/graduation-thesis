import { Schema, model, Document, Types } from "mongoose";

const productSchema = new Schema({
  postId: {
    type: Types.ObjectId,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  toppings: {
    type: [String],
    default: [],
  },
  timeToPrepare: {
    type: Number,
    required: true,
  },
  reviews: {
    type: [
      {
        userId: {
          type: Types.ObjectId,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        review: {
          type: String,
          required: true,
        },
      },
    ],
    default: [],
  },
});

const productModel = model("Product", productSchema);
export default productModel;
