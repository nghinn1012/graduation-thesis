import mongoose, { model, Schema } from "mongoose";

const LikeSchema = new Schema({
  user: {
    type: String,
    required: true,
    index: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postLikeModel = model("Like", LikeSchema);
export default postLikeModel;
