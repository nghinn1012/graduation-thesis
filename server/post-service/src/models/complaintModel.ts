import { Schema, model } from "mongoose";

const complaintSchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Post"
  },
  userId: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "resolved", "rejected"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const complaintModel = model("Complaint", complaintSchema);
export default complaintModel;
