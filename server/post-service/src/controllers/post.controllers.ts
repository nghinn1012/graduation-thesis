import { Request, Response } from "express";
import {
  createPostService,
  deletePostService,
  getAllPostsService,
  getPostService,
  updatePostService,
  searchPostService,
  getAllPostsOfUserService,
} from "../services/post.services";
import { AuthRequest, validatePostFoodBody } from "../data";

export const createPostController = async (
  request: AuthRequest,
  response: Response
) => {
  try {
    const postData = {
      ...request.body.post,
      author: request.authContent?.data.userId,
    };
    let productData = null;
    if (postData.hasProduct) {
      productData = {
        ...request.body.product,
        postId: postData._id,
      };
    }

    validatePostFoodBody(postData);
    console.log("postData:", postData);
    console.log("productData:", productData);

    const result = await createPostService(postData, productData);
    console.log("result:", result);
    if (result.post == null) {
      return response.status(400).json({
        message: "Cannot create post",
        error: "Post is null",
      });
    }

    return response.status(200).json(result);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot create post",
      error: error as Error,
    });
  }
};

export const getPostController = async (
  request: Request,
  response: Response
) => {
  try {
    const postId = request.params.id;
    const post = await getPostService(postId);
    if (!post) {
      return response.status(400).json({
        message: "Cannot get post",
      });
    }
    return response.status(200).json(post);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot get post",
      error: (error as Error).message,
    });
  }
};

export const updatePostController = async (
  request: AuthRequest,
  response: Response
) => {
  try {
    const postId = request.params.id;
    const postData = request.body;
    if (!request.authContent?.data?.userId) {
      return response.status(400).json({
        message: "Can't update post without user validate",
      });
    }
    const post = await updatePostService(
      postId,
      postData,
      request.authContent.data.userId
    );
    if (!post) {
      return response.status(400).json({
        message: "Cannot update post",
      });
    }
    return response.status(200).json(post);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot update post",
      error: error as Error,
    });
  }
};

export const getAllPostsController = async (
  request: Request,
  response: Response
) => {
  try {
    const page = parseInt(request.query.page as string, 10) || 1;
    const limit = parseInt(request.query.limit as string, 10) || 20;
    const userId = request.query.userId as string;
    const posts = await getAllPostsService(page, limit, userId);
    if (posts === null) {
      return response.status(400).json({
        message: "Cannot get posts",
      });
    }
    return response.status(200).json(posts);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot get posts",
      error: error as Error,
    });
  }
};

export const getAllPostsOfUserController = async (
  request: AuthRequest,
  response: Response
) => {
  try {
    const page = parseInt(request.query.page as string, 10) || 1;
    const limit = parseInt(request.query.limit as string, 10) || 20;
    const userId = request.params.userId;
    if (!userId) {
      return response.status(400).json({
        message: "Can't get posts without user validate",
      });
    }
    const posts = await getAllPostsOfUserService(userId, page, limit);
    if (!posts) {
      return response.status(400).json({
        message: "Cannot get posts",
      });
    }
    return response.status(200).json(posts);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot get posts",
      error: (error as Error).message,
    });
  }
};

export const deletePostController = async (
  request: AuthRequest,
  response: Response
) => {
  try {
    const postId = request.params.id;
    if (!request.authContent?.data?.userId) {
      return response.status(400).json({
        message: "Can't delete post without user validate",
      });
    }
    const post = await deletePostService(
      postId,
      request.authContent?.data.userId
    );
    if (!post) {
      return response.status(400).json({
        message: "Cannot delete post",
      });
    }
    return response.status(200).json(post);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot delete post",
      error: (error as Error).message,
    });
  }
};

export const searchPostController = async (
  request: AuthRequest,
  response: Response
) => {
  try {
    const {
      query,
      page,
      pageSize,
      minTime,
      maxTime,
      minQuality,
      haveMade,
      difficulty,
      hashtags,
      timeOrder,
      qualityOrder,
    } = request.query;

    console.log("query:", query);

    if (typeof query !== "string") {
      return response.status(400).json({
        message: "Invalid search query. It must be a non-empty string.",
      });
    }
    if (typeof minTime !== "string" || minTime === undefined) {
      return response.status(400).json({
        message: "Invalid minTime. It must be a string.",
      });
    }
    if (typeof maxTime !== "string" || maxTime === undefined) {
      return response.status(400).json({
        message: "Invalid maxTime. It must be a string.",
      });
    }
    if (typeof minQuality !== "string" || minQuality === undefined) {
      return response.status(400).json({
        message: "Invalid minQuality. It must be a string.",
      });
    }

    console.log(difficulty, hashtags);
    const parsedDifficulty = Array.isArray(difficulty)
      ? difficulty
      : difficulty
      ? [difficulty]
      : []; // Mặc định là mảng rỗng nếu không truyền

    const parsedHashtags = Array.isArray(hashtags)
      ? hashtags
      : hashtags
      ? [hashtags]
      : []; // Mặc định là mảng rỗng nếu không truyền
    const parsedPageSize = pageSize ? parseInt(pageSize as string, 10) : 10;
    const parsedPage = page ? parseInt(page as string, 10) : 1;

    const {
      posts,
      total,
      page: currentPage,
      pageSize: currentPageSize,
    } = await searchPostService(
      query as string,
      minTime,
      maxTime,
      Number(minQuality),
      Boolean(haveMade),
      parsedDifficulty as string[],
      parsedHashtags as string[],
      timeOrder as unknown as number,
      qualityOrder as unknown as number,
      parsedPageSize,
      parsedPage
    );

    if (!posts || posts.length === 0) {
      return response.status(200).json({
        message: "No posts found matching the search criteria.",
        posts: [],
        totalPosts: total,
        currentPage,
        pageSize: currentPageSize,
      });
    }

    return response.status(200).json({
      message: "Posts retrieved successfully.",
      posts,
      totalPosts: total,
      currentPage,
      pageSize: currentPageSize,
      totalPages: Math.ceil(total / currentPageSize),
    });
  } catch (error) {
    console.error("Error in searchPostController:", error);
    return response.status(500).json({
      message: "An error occurred while searching for posts.",
      error: (error as Error).message,
    });
  }
};
