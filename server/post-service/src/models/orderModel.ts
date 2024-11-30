import { Schema, model, Types } from "mongoose";

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
          type: String,
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
  info: {
    type: {
      name: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
    },
    default: {},
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
  transactionId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["SUCCESS","FAILED"],
  },
  status: {
    type: String,
    enum: ["Pending", "Delivering", "Completed", "Cancelled By Seller", "Cancelled By User"],
    default: "Pending",
  },
  reason: {
    type: String,
    default: "",
  },
  shippingFee: {
    type: Number,
    default: 0,
  },
  amount: {
    type: Number,
    default: 0,
  },
  isReviewed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const orderModel = model("Order", orderSchema);
export default orderModel;
