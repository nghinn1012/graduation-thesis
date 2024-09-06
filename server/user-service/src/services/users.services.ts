import { Request, Response } from "express";
import { InvalidDataError } from "../data/invalid_data.data";
import UserModel from "../db/models/User.models";
import { validatePassword } from "../data/validation.data";
import { hashText } from "../utlis/bcrypt";
import { v2 as cloudinary } from "cloudinary";

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
    const { avatar, coverImage, ...textData } = updateData;

    validatePassword(updateData.password);
    if (updateData.password !== updateData.confirmPassword) {
      throw new InvalidDataError({
        message: "Password does not match"
      });
    }

    const hashedPassword = await hashText(updateData.password);
    let user = await UserModel.findByIdAndUpdate(
      userId,
      {
        ...textData,
        password: hashedPassword,
      },
      {
        new: true, runValidators: true

      });
    user = await UserModel.findById(userId);
    if (!user) {
      throw new InvalidDataError({
        message: "User not found"
      });
    }
    if (avatar) {
      if (user.avatar) {
        await cloudinary.uploader.destroy(user.avatar.split("/").pop()!.split(".")![0]);
      }
      const uploadedRespone = await cloudinary.uploader.upload(avatar, {
        folder: "users",
      });
      await UserModel.findByIdAndUpdate(userId, {
        avatar: uploadedRespone.secure_url
      }, { new: true, runValidators: true });
    }
    if (coverImage) {
      if (user.coverImage) {
        await cloudinary.uploader.destroy(user.coverImage.split("/").pop()!.split(".")![0]);
      }
      const uploadedRespone = await cloudinary.uploader.upload(coverImage, {
        folder: "users",
      });
      await UserModel.findByIdAndUpdate(userId, {
        coverImage: uploadedRespone.secure_url
      }, { new: true, runValidators: true });
    }
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
