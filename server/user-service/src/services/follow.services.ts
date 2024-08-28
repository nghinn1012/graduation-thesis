import { ObjectId } from "mongodb";
import { InvalidDataError } from "../data/invalid_data.data";
import UserModel from "../db/models/User.models"
import FollowerModel from "../db/models/Follower.models";

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

  const isFollowing = await FollowerModel.find({ user: userId, subscriber: currentUserId });
  if (isFollowing.length > 0) {
    // unfollow
    await FollowerModel.findByIdAndDelete(isFollowing[0]._id);
    return "User unfollowed successfully!"
  } else {
    //follow
    await FollowerModel.create({
      followType: 0,
      user: userId,
      subscriber: currentUserId
    });
    return "User followed successfully!"
  }
}
export const getSuggestUserService = async (currentUserId: string) => {
  const usersFollowedByCurrentUser = await FollowerModel.find({
    subscriber: currentUserId,
    followType: 0
  }).select('user');
  const followedUserIds = usersFollowedByCurrentUser.map(follower => follower!.user!.toString());

  const users = await UserModel.aggregate([
    {
      $match: {
        _id: { $ne: currentUserId }
      }
    },
    { $sample: { size: 10 } }
  ]);

  const filteredUsers = users.filter(user => !followedUserIds.includes(user._id.toString()));

  const suggestedUsers = filteredUsers.slice(0, 5);

  suggestedUsers.forEach(user => {
    user.password = null;
    user.refreshToken = null;
  });

  return suggestedUsers;
}
