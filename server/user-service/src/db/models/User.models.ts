import { Schema, model } from "mongoose";

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
  username: {
    type: String
  }, // Optional
  avatar: {
    type: String
  }, // Optional
});

UserSchema.index({ name: "text" });

const UserModel = model("User", UserSchema);

export default UserModel;
