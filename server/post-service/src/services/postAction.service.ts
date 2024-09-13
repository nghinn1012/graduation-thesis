import { InternalError } from '../data';
import postLikeModel from '../models/postLikeModel';
import postModel from '../models/postModel';
import { Id, rpcGetUser } from './index.services';

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
    const isLiked = postLikeModel.exists({ user: userId, post: postId });
    if (await isLiked) {
      await postLikeModel.deleteOne({ user: userId, post: postId });
      await postModel.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
      return { liked: false };
    }
    await postLikeModel.create({ user: userId, post: postId });
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
    const likes = await postLikeModel.find({ user: userId });

    const postIds = likes.map(like => like.post);
    return postIds;
  } catch (error) {
    throw new Error(`Cannot get post likes by user: ${(error as Error).message}`);
  }
}
