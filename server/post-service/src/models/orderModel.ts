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
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Delivering", "Completed"],
    default: "Pending",
  },
  amount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const orderModel = model("Order", orderSchema);
export default orderModel;
