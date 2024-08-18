import User from "../models/userModel";
import bcrypt from "bcrypt"

interface ManualAccountRegisterInfo {
  email: string;
  password: string;
  name: string;
}

export const registerUser = async (info: ManualAccountRegisterInfo) => {
  const { email, password, name } = info;
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    email,
    name,
    password: hashedPassword,
  });

  await newUser.save();

  return newUser;
};
