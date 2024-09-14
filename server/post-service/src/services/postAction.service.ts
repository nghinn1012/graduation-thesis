import { InternalError } from '../data';
import postLikeModel from '../models/postLikeModel';
import postModel from '../models/postModel';
import savedListModel from '../models/savedListModel.model';
import { Id, rpcGetUser } from './index.services';
import mongoose from 'mongoose';

export const likeOrUnlikePostService = async (postId: string, userId: string) => {
  try {
    const post = await postModel.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    const user = await rpcGetUser<Id>(userId, "_id");
    if (!user) {
      console.log("rpc-author", "unknown");
      throw new InternalError({
        data: {
          target: "rpc-author",
          reason: "unknown",
        },
      });
    }
    const isLiked = postLikeModel.exists({ userId: userId, postId: postId });
    if (await isLiked) {
      await postLikeModel.deleteOne({ userId: userId, postId: postId });
      await postModel.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
      return { liked: false };
    }
    await postLikeModel.create({ userId: userId, postId: postId });
    await postModel.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });
    return { liked: true };
  } catch (error) {
    throw new Error(`Cannot like or unlike post: ${(error as Error).message}`);
  }
}

export const getPostLikesByUserService = async (userId: string) => {
  try {
    const user = await rpcGetUser<Id>(userId, "_id");
    if (!user) {
      console.log("rpc-author", "unknown");
      throw new InternalError({
        data: {
          target: "rpc-author",
          reason: "unknown",
        },
      });
    }
    const likes = await postLikeModel.find({ userId: userId });

    const postIds = likes.map(like => like.postId);
    return postIds;
  } catch (error) {
    throw new Error(`Cannot get post likes by user: ${(error as Error).message}`);
  }
}

export const saveOrUnsavedPostService = async (postId: string, userId: string) => {
  try {
    const postObjectId = new mongoose.Types.ObjectId(postId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const post = await postModel.findById(postObjectId);
    if (!post) {
      throw new Error('Post not found');
    }

    const user = await rpcGetUser<Id>(userId, "_id");
    if (!user) {
      console.log("rpc-author", "unknown");
      throw new InternalError({
        data: {
          target: "rpc-author",
          reason: "unknown",
        },
      });
    }

    const savedList = await savedListModel.findOne({ userId: userObjectId });

    if (savedList) {
      const postIdIndex = savedList.postIds.indexOf(postObjectId);

      if (postIdIndex > -1) {
        savedList.postIds.splice(postIdIndex, 1);
        await savedList.save();
        await postModel.findByIdAndUpdate(postObjectId, { $inc: { savedCount: -1 } });
        return { saved: false };
      } else {
        savedList.postIds.push(postObjectId);
        await savedList.save();
        await postModel.findByIdAndUpdate(postObjectId, { $inc: { savedCount: 1 } });
        return { saved: true };
      }
    } else {
      await savedListModel.create({ userId: userObjectId, postIds: [postObjectId.toString()] });
      await postModel.findByIdAndUpdate(postObjectId, { $inc: { savedCount: 1 } });
      return { saved: true };
    }
  } catch (error) {
    throw new Error(`Cannot save or unsave post: ${(error as Error).message}`);
  }
};

export const getSavedPostsByUserService = async (userId: string) => {
  try {
    const savedList = await savedListModel.findOne({ userId: userId });
    if (!savedList) {
      return [];
    }
    const postIds = savedList.postIds.map((postId) => postId.toString());
    return postIds;
  } catch (error) {
    throw new Error(`Cannot get saved posts by user: ${(error as Error).message}`);
  }
}

export const isLikedPostByUserService = async (postId: string, userId: string) => {
  try {
    const response = await postLikeModel.exists({ postId: postId, userId: userId });
    return response;
  } catch (error) {
    throw new Error(`Cannot check if post is liked by user: ${(error as Error).message}`);
  }
}

export const isSavedPostByUserService = async (postId: string, userId: string) => {
  try {
    const postObjectId = new mongoose.Types.ObjectId(postId);
    const savedList = await savedListModel.findOne({ userId: userId });
    if (!savedList) {
      return false;
    }
    const response = savedList.postIds.includes(postObjectId);
    return response;
  } catch (error) {
    throw new Error(`Cannot check if post is saved by user: ${(error as Error).message}`);
  }
}
