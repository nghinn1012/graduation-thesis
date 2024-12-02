import { InvalidDataError } from "../data/invalid_data.data";
import UserModel from "../db/models/User.models"
import { notifyFollowUser } from "./rpc.services";

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
    await UserModel.findByIdAndUpdate
    (userId, {
      $pull: { followers: currentUserId }
    });
    await UserModel.findByIdAndUpdate
    (currentUserId, {
      $pull: { following: userId }
    });
    return {
      message: "User unfollowed successfully!",
      user: {
        _id: currentUser._id.toString(),
        name: currentUser.name,
        avatar: currentUser.avatar,
        username: currentUser.username
      }
    }
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
    await notifyFollowUser(userId, {
      _id: currentUser._id.toString(),
      name: currentUser.name,
      avatar: currentUser.avatar,
      username: currentUser.username
    }
    )
    return {
      message: "User followed successfully!",
      user: {
        _id: currentUser._id.toString(),
        name: currentUser.name,
        avatar: currentUser.avatar,
        username: currentUser.username
      }
    }
  }
}

export const getSuggestUserService = async (currentUserId: string) => {
  const currentUser = await UserModel.findById(currentUserId).populate('following');
  const followedUserIds = currentUser?.following.map((user: any) => user._id.toString());

  const users = await UserModel.aggregate([
    {
      $match: {
        _id: { $ne: currentUser?._id },
      }
    },
    { $sample: { size: 10 } }
  ]);

  const suggestedUsers = users.filter(user => {
    const userIdStr = user._id.toString();
    return !followedUserIds?.includes(userIdStr) && userIdStr !== currentUserId;
  }).slice(0, 5);

  suggestedUsers.forEach(user => {
    user.password = null;
    user.refreshToken = null;
  });

  return suggestedUsers;
};

export const getFollowersService = async (userId: string) => {
  const user = await UserModel.findById(userId).populate('followers');
  const followers = user?.followers.map((user: any) => {
    user.password = null;
    user.refreshToken = null;
    return user;
  });
  return followers;
}

export const getFollowingService = async (userId: string) => {
  const user = await UserModel.findById(userId).populate('following');
  const following = user?.following.map((user: any) => {
    user.password = null;
    user.refreshToken = null;
    return user;
  });
  return following;
}
