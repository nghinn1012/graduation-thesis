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

    // Tìm người dùng theo ID
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

    // Tìm bản ghi trong savedListModel cho userId
    const savedList = await savedListModel.findOne({ userId: userObjectId });

    if (savedList) {
      // Nếu bản ghi đã tồn tại
      const postIdIndex = savedList.postIds.indexOf(postObjectId);

      if (postIdIndex > -1) {
        // Nếu postId đã tồn tại trong mảng, xóa nó và giảm số lượng lưu
        savedList.postIds.splice(postIdIndex, 1);
        await savedList.save();
        await postModel.findByIdAndUpdate(postObjectId, { $inc: { savedCount: -1 } });
        return { saved: false };
      } else {
        // Nếu postId không tồn tại trong mảng, thêm nó và tăng số lượng lưu
        savedList.postIds.push(postObjectId);
        await savedList.save();
        await postModel.findByIdAndUpdate(postObjectId, { $inc: { savedCount: 1 } });
        return { saved: true };
      }
    } else {
      // Nếu không tìm thấy bản ghi cho userId, tạo bản ghi mới
      await savedListModel.create({ userId: userObjectId, postIds: [postObjectId.toString()] });
      await postModel.findByIdAndUpdate(postObjectId, { $inc: { savedCount: 1 } });
      return { saved: true };
    }
  } catch (error) {
    throw new Error(`Cannot save or unsave post: ${(error as Error).message}`);
  }
};
