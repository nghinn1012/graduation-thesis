import { Schema, model, Document, Types } from "mongoose";

const orderSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  sellerId: {
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
  address: {
    type: String,
    default: "",
  },
  note: {
    type: String,
    default: "",
  },
  paymentMethod: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const orderModel = model("Order", orderSchema);
export default orderModel;
