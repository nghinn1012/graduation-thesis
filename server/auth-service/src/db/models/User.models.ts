import { Schema, model } from "mongoose";
import { ObjectId } from "mongodb";

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
    type: String,
    enum: UserVerifyStatus,
    default: UserVerifyStatus.Unverified,
  },
  username: {
    type: String
  }, // Optional
  avatar: {
    type: String
  }, // Optional
});

const UserModel = model("User", UserSchema);

export default UserModel;
