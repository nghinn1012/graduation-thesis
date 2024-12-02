import mongoose, { Schema, model, Document } from "mongoose";

export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned,
}

// interface IUser extends Document {
//   name: string;
//   email: string;
//   password?: string;
//   verify: UserVerifyStatus;
//   refreshToken?: string;
//   googleId?: string;
//   googleEmail?: string;
//   googleAccessToken?: string;
//   googleRefreshToken?: string;
//   username?: string;
//   avatar?: string;
//   coverImage?: string;
//   bio?: string;
//   followers: string[];
//   following: string[];
// }

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
    required: function(this: any) {
      return !this.googleId;
    }
  },
  verify: {
    type: Number,
    enum: UserVerifyStatus,
    default: UserVerifyStatus.Unverified,
  },
  refreshToken: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  googleEmail: {
    type: String,
    sparse: true
  },
  googleAccessToken: {
    type: String
  },
  googleRefreshToken: {
    type: String
  },
  username: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
  coverImage: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  followers: {
    type: [String],
    ref: "User",
    default: [],
  },
  following: {
    type: [String],
    ref: "User",
    default: [],
  },
},
{ timestamps: true });

UserSchema.index({ name: "text" });
UserSchema.index({ googleId: 1 });

const UserModel = model("User", UserSchema);

export default UserModel;
