import { ObjectId } from "mongodb";
import { InvalidDataError } from "../data/invalid_data.data";
import UserModel from "../db/models/User.models"

export const followAndUnFollowUserService = async (currentUserId: string, userId: string) => {
  if (userId == currentUserId) {
    throw new InvalidDataError({
      message: "You can't follow yourself!"
    })
  }
  const userToFollow = await UserModel.findById(userId);
  const currentUser = await UserModel.findById(currentUserId);

  if (!userToFollow || !currentUser) {
    throw new InvalidDataError({
      message: "User not found!"
    })
  }

  const isFollowing = currentUser.following.includes(userId as unknown as ObjectId);
  if (isFollowing) {
    // unfollow
    await UserModel.findByIdAndUpdate(userId, { $pull: { followers: currentUserId } })
    await UserModel.findByIdAndUpdate(currentUserId, { $pull: { following: userId } })
    return "User unfollowed successfully!"
  } else {
    //follow
    await UserModel.findByIdAndUpdate(userId, { $push: { followers: currentUserId } })
    await UserModel.findByIdAndUpdate(currentUserId, { $push: { following: userId } })
    return "User followed successfully!"
  }
}
