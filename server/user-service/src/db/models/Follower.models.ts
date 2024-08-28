import { model, Schema } from "mongoose";

enum FollowType {
  User = 0,
  Hashtag = 1,
}

const Follower = new Schema({
  followType: {
    type: Number,
    enum: FollowType,
    required: true,
  },
  hashtag: {
    type: Schema.Types.ObjectId,
    ref: "Hashtag",
    index: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  subscriber: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
},
  { timestamps: true });

const FollowerModel = model("Follower", Follower);

export default FollowerModel;
