import { Request, Response } from "express";
import { InvalidDataError } from "../data/invalid_data.data";
import UserModel from "../db/models/User.models";

interface UpdateDataInfo {
  name: string;
  avatar: string;
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
    const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
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
