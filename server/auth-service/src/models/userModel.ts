import { Schema, model, Document } from "mongoose";

interface IUser extends Document {
  email: string;
  name: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
});

const User = model<IUser>("User", userSchema);

export default User;
