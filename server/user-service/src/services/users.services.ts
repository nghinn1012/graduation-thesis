import { InvalidDataError, validatePassword } from "../data/index.data";
import { UserSearchBuilder } from "../data/query_builder";
import UserModel from "../db/models/User.models";
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
export const searchAndFilterUserService = async (
  searchTerm: string,
  userId: string,
  pageSize: number,
  page: number,
) => {
  const userSearchBuilder = new UserSearchBuilder()
    .search(searchTerm)
    .paginate(pageSize, page);

  const pipeline = userSearchBuilder.build();

  let users = await UserModel.aggregate(pipeline);
  users = users.filter((user) => user._id.toString() !== userId);

  const totalUsers = await UserModel.countDocuments(userSearchBuilder.getMatchCriteria());
  const totalPages = Math.ceil(totalUsers / pageSize);

  return {
    users,
    totalUsers,
    totalPages,
    currentPage: page,
    pageSize,
  };
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

export const getAllUsersService = async () => {
  try {
    const users = await UserModel.find();
    return users;
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message || 'Get all users failed!',
    });
  }
}
