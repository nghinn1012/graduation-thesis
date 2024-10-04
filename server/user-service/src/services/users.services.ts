import { InvalidDataError, validatePassword } from "../data/index.data";
import { UserSearchBuilder } from "../data/query_builder";
import UserModel from "../db/models/User.models";
import { hashText } from "../utlis/bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { deleteImageFromCloudinary, extractPublicIdFromUrl, uploadImageToCloudinary } from "./imagesuploader.services";
import { brokerOperations, BrokerSource, RabbitMQ } from "../broker";

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
    console.log("chay qua");
    const { avatar, coverImage, ...textData } = updateData;

    let user = await UserModel.findByIdAndUpdate(
      userId,
      { ...textData },
      {
        new: true,
        runValidators: true,
      }
    );

    user = await UserModel.findById(userId);
    if (!user) {
      throw new InvalidDataError({
        message: "User not found",
      });
    }

    const uploadTasks: Promise<any>[] = [];

    if (avatar && avatar !== user.avatar) {
      if (user.avatar) {
        const oldAvatarId = extractPublicIdFromUrl(user.avatar);
        uploadTasks.push(deleteImageFromCloudinary(oldAvatarId));
      }

      const uploadAvatarTask = uploadImageToCloudinary(avatar, 'users')
        .then((uploadedUrl) => {
          return UserModel.findByIdAndUpdate(
            userId,
            { avatar: uploadedUrl },
            { new: true, runValidators: true }
          );
        });

      uploadTasks.push(uploadAvatarTask);
    }

    if (coverImage && coverImage !== user.coverImage) {
      if (user.coverImage) {
        const oldCoverImageId = extractPublicIdFromUrl(user.coverImage);
        uploadTasks.push(deleteImageFromCloudinary(oldCoverImageId));
      }

      const uploadCoverImageTask = uploadImageToCloudinary(coverImage, 'users')
        .then((uploadedUrl) => {
          return UserModel.findByIdAndUpdate(
            userId,
            { coverImage: uploadedUrl },
            { new: true, runValidators: true }
          );
        });

      uploadTasks.push(uploadCoverImageTask);
    }

    const updatedUser = user;

    Promise.all(uploadTasks)
      .then(([updatedAvatar, updatedCoverImage]) => {
        RabbitMQ.instance.publicMessage(
          BrokerSource.NOTIFICATION,
          brokerOperations.user.NOTIFY_UPLOADS_IMAGE_COMPLETE,
          {
            _id: userId,
            type: "user_profile_updated",
          }
        );
      })
      .catch((uploadError) => {
        console.error("Image upload failed: ", uploadError);
      });

    return updatedUser;
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message || 'Update user failed!',
    });
  }
};



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
