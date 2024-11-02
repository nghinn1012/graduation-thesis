import { Schema, model, Document, Types } from "mongoose";

const reviewSchema = new Schema({
  userId: {
    type: String,
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
  orderId: {
    type: Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

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
  timeToPrepare: {
    type: Number,
    required: true,
  },
  reviews: {
    type: [reviewSchema],
    default: [],
  },
  averageRating: {
    type: Number,
    default: 0,
  },
});

const productModel = model("Product", productSchema);
const reviewModel = model("Review", reviewSchema);

export default productModel;
