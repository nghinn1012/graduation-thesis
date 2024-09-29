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

  const isFollowing = await UserModel.find({
    _id: userId,
    followers: { $in : [currentUserId] }
  });
  if (isFollowing.length > 0) {
    // unfollow
    await UserModel.findByIdAndUpdate
    (userId, {
      $pull: { followers: currentUserId }
    });
    await UserModel.findByIdAndUpdate
    (currentUserId, {
      $pull: { following: userId }
    });
    return "User unfollowed successfully!"
  } else {
    //follow
    await UserModel.findByIdAndUpdate
    (userId, {
      $push: { followers: currentUserId }
    });
    await UserModel.findByIdAndUpdate
    (currentUserId, {
      $push: { following: userId }
    });
    return "User followed successfully!"
  }
}
export const getSuggestUserService = async (currentUserId: string) => {
  const usersFollowedByCurrentUser = await UserModel.find({
    _id: currentUserId
    }).populate("followers");
  const followedUserIds = usersFollowedByCurrentUser.map(follower => follower._id.toString());

  const users = await UserModel.aggregate([
    {
      $match: {
        _id: { $ne: currentUserId }
      }
    },
    { $sample: { size: 5 } }
  ]);

  console.log(currentUserId);
  const filteredUsers = users.filter(user => !followedUserIds.
    includes(user._id.toString())
    && currentUserId !== user._id.toString());

  const suggestedUsers = filteredUsers.slice(0, 5);

  suggestedUsers.forEach(user => {
    user.password = null;
    user.refreshToken = null;
  });

  return suggestedUsers;
}
