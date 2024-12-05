import { InternalError } from "../data";
import postLikeModel from "../models/postLikeModel";
import postModel from "../models/postModel";
import savedListModel from "../models/savedListModel.model";
import { IAuthor, Id, rpcGetUser, rpcGetUsers } from "./index.services";
import mongoose from "mongoose";
import { notifyLikedFood, notifySavedFood } from "./notify.services";

export const likeOrUnlikePostService = async (
  postId: string,
  userId: string
) => {
  try {
    const post = await postModel.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }
    const user = await rpcGetUser<IAuthor>(userId, [
      "_id",
      "name",
      "avatar",
      "username",
    ]);
    if (!user) {
      console.log("rpc-author", "unknown like post");
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
    if (userId !== post.author.toString()) {
      await notifyLikedFood(
        user,
        {
          _id: post._id.toString(),
          title: post.title,
          image: post.images[0],
        },
        post.author
      );
    }
    return { liked: true };
  } catch (error) {
    throw new Error(`Cannot like or unlike post: ${(error as Error).message}`);
  }
};

export const getPostLikesByUserService = async (
  userId: string,
  page?: number,
  limit?: number
) => {
  try {
    const likes = await postLikeModel
      .find({ userId: userId, isDeleted: false })
      .sort({ createdAt: -1 });

    const postsLikesWithInfo = await Promise.all(
      likes.map(async (like) => {
        const post = await postModel.findById(like.postId);
        return post;
      })
    );

    if (!postsLikesWithInfo || postsLikesWithInfo.length === 0) {
      return [];
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      const paginatedPosts = postsLikesWithInfo.slice(skip, skip + limit);
      const authors = await rpcGetUsers<IAuthor[]>(
        paginatedPosts.map((post) => post?.author || ""),
        ["_id", "email", "name", "avatar", "username"]
      );

      const postsWithAuthors = paginatedPosts.map((post) => ({
        ...post?.toObject(),
        author: authors?.find(
          (author) => author._id.toString() === post?.author.toString()
        ),
      }));

      return postsWithAuthors;
    }

    const postIds = postsLikesWithInfo.map((post) => post?._id.toString());
    return postIds;
  } catch (error) {
    throw new Error(
      `Cannot get post likes by user: ${(error as Error).message}`
    );
  }
};

export const saveOrUnsavedPostService = async (
  postId: string,
  userId: string
) => {
  try {
    const postObjectId = new mongoose.Types.ObjectId(postId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const post = await postModel.findById(postObjectId);
    if (!post) {
      throw new Error("Post not found");
    }

    const user = await rpcGetUser<IAuthor>(userId, [
      "_id",
      "name",
      "avatar",
      "username",
    ]);
    if (!user) {
      console.log("rpc-author", "unknown savepost");
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
        await postModel.findByIdAndUpdate(postObjectId, {
          $inc: { savedCount: -1 },
        });
        return { saved: false };
      } else {
        savedList.postIds.push(postObjectId);
        await savedList.save();
        await postModel.findByIdAndUpdate(postObjectId, {
          $inc: { savedCount: 1 },
        });
        if (user._id !== post.author.toString()) {
          await notifySavedFood(
            user,
            {
              _id: post._id.toString(),
              title: post.title,
              image: post.images[0],
            },
            post.author
          );
        }
        return { saved: true };
      }
    } else {
      await savedListModel.create({
        userId: userObjectId,
        postIds: [postObjectId.toString()],
      });
      await postModel.findByIdAndUpdate(postObjectId, {
        $inc: { savedCount: 1 },
      });
      return { saved: true };
    }
  } catch (error) {
    throw new Error(`Cannot save or unsave post: ${(error as Error).message}`);
  }
};

export const getSavedPostsByUserService = async (userId: string) => {
  try {
    const savedList = await savedListModel.findOne({ userId: userId, isDeleted: false });
    if (!savedList) {
      return [];
    }
    const postIds = savedList.postIds.map((postId) => postId.toString());
    return postIds;
  } catch (error) {
    throw new Error(
      `Cannot get saved posts by user: ${(error as Error).message}`
    );
  }
};

export const isLikedPostByUserService = async (
  postId: string,
  userId: string
) => {
  try {
    const response = await postLikeModel.exists({
      postId: postId,
      userId: userId,
      isDeleted: false,
    });
    return response;
  } catch (error) {
    throw new Error(
      `Cannot check if post is liked by user: ${(error as Error).message}`
    );
  }
};

export const isSavedPostByUserService = async (
  postId: string,
  userId: string
) => {
  try {
    const postObjectId = new mongoose.Types.ObjectId(postId);
    const savedList = await savedListModel.findOne({ userId: userId });
    if (!savedList) {
      return false;
    }
    const response = savedList.postIds.includes(postObjectId);
    return response;
  } catch (error) {
    throw new Error(
      `Cannot check if post is saved by user: ${(error as Error).message}`
    );
  }
};

export const getPostByUserFollowingService = async (
  userId: string,
  page?: number,
  limit?: number
) => {
  try {
    console.log(userId);
    if (!userId) return [];
    const user = await rpcGetUser<IAuthor>(userId, [
      "_id",
      "following",
      "followers",
    ]);
    console.log(user);
    if (!user) {
      console.log("rpc-author", "unknown get post by user following");
      throw new InternalError({
        data: {
          target: "rpc-author",
          reason: "unknown",
        },
      });
    }

    const following = user.following;

    if (!following || following.length === 0) {
      return [];
    }

    const posts = await postModel.find({ author: { $in: following }, isDeleted: false }).sort({ createdAt: -1 });

    if (!posts || posts.length === 0 || !page || !limit) {
      return [];
    }

    const skip = (page - 1) * limit;
    const paginatedPosts = posts.slice(skip, skip + limit);
    const authors = await rpcGetUsers<IAuthor[]>(
      paginatedPosts.map((post) => post?.author || ""),
      ["_id", "email", "name", "avatar", "username", "followers"]
    );

    const postsWithAuthors = paginatedPosts.map((post) => ({
      ...post?.toObject(),
      author: authors?.find(
        (author) => author._id.toString() === post?.author.toString()
      ),
    }));
    return postsWithAuthors;
  } catch (error) {
    throw new Error(
      `Cannot get post by user following: ${(error as Error).message}`
    );
  }
};
