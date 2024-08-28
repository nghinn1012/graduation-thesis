import { Request, Response } from "express";
import { InvalidDataError } from "../data/invalid_data.data";
import UserModel from "../db/models/User.models";
import { validatePassword } from "../data/validation.data";
import { hashText } from "../utlis/bcrypt";

export interface UpdateDataInfo {
  password: string;
  name: string;
  confirmPassword: string;
  username: string;
  avatar: string;
  coverImage: string;
  bio: string;
}

export const searchUserByNameService = async (searchTerm: string) => {
  try {
    const users = await UserModel.find({
      name: { $regex: searchTerm, $options: "i" }
    });

    return users;
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message || 'Search failed',
    });
  }
};

export const updateUserService = async (userId: string, updateData: UpdateDataInfo) => {
  try {
    validatePassword(updateData.password);
    if (updateData.password !== updateData.confirmPassword) {
      throw new InvalidDataError({
        message: "Password does not match"
      });
    }

    const hashedPassword = await hashText(updateData.password);
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        ...updateData,
      password: hashedPassword,
      },
      {
        new: true, runValidators: true

      });
    const updatedUser = await UserModel.findById(userId);

    if (user) {
      return updatedUser
    }
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message || 'Update user failed!',
    });
  }
}
