import User from "../models/userModel";
import bcrypt from "bcrypt"

export const registerUser = async (email: string, password: string, name: string) => {
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
