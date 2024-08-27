import mongoose, { Schema, model } from "mongoose";

enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned,
}

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  verify: {
    type: Number,
    enum: UserVerifyStatus,
    default: UserVerifyStatus.Unverified,
  },
  refreshToken: {
    type: String,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: []
    }
  ],
  username: {
    type: String,
    default: "",
  }, // Optional
  avatar: {
    type: String,
    default: "",
  }, // Optional
  coverImage: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
},
  { timestamps: true });

UserSchema.index({ name: "text" });

const UserModel = model("User", UserSchema);

export default UserModel;
