import mongoose, { model, Schema } from "mongoose";

const CommentSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
    index: true,
  },
  comment: {
    type: String,
    required: true,
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  },
  userMention: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CommentSchema.index({ post: 1, parentCommentId: 1 });

const CommentModel = model("Comment", CommentSchema);
export default CommentModel;
