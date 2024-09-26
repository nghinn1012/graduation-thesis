import { Request, Response } from "express";
import { createPostService, deletePostService, getAllPostsService, getPostService, updatePostService, searchPostService } from "../services/post.services";
import { AuthRequest, validatePostFoodBody } from "../data";

export const createPostController = async (request: AuthRequest, response: Response) => {
  try {
    const postData = {
      ...request.body,
      author: request.authContent?.data.userId
    };

    validatePostFoodBody(postData);

    const post = await createPostService(postData);

    if (post == null) {
      return response.status(400).json({
        message: "Cannot create post"
      });
    }

    return response.status(200).json(post);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot create post",
      error: (error as Error).message
    });
  }
};

export const getPostController = async (request: Request, response: Response) => {
  try {
    const postId = request.params.id;
    const post = await getPostService(postId);
    if (!post) {
      return response.status(400).json({
        message: "Cannot get post"
      });
    }
    return response.status(200).json(post);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot get post",
      error: (error as Error).message
    });
  }
}

export const updatePostController = async (request: AuthRequest, response: Response) => {
  try {
    const postId = request.params.id;
    const postData = request.body;
    if (!request.authContent?.data?.userId) {
      return response.status(400).json({
        message: "Can't update post without user validate"
      });
    }
    const post = await updatePostService(postId, postData, request.authContent.data.userId);
    if (!post) {
      return response.status(400).json({
        message: "Cannot update post"
      });
    }
    return response.status(200).json(post);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot update post",
      error: (error as Error)
    });
  }
}

export const getAllPostsController = async (request: Request, response: Response) => {
  try {
    const page = parseInt(request.query.page as string, 10) || 1;
    const limit = parseInt(request.query.limit as string, 10) || 20;
    const posts = await getAllPostsService(page, limit);
    if (!posts) {
      return response.status(400).json({
        message: "Cannot get posts"
      });
    }
    return response.status(200).json(posts);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot get posts",
      error: (error as Error).message
    });
  }
}

export const deletePostController = async (request: AuthRequest, response: Response) => {
  try {
    const postId = request.params.id;
    if (!request.authContent?.data?.userId) {
      return response.status(400).json({
        message: "Can't delete post without user validate"
      });
    }
    const post = await deletePostService(postId, request.authContent?.data.userId);
    if (!post) {
      return response.status(400).json({
        message: "Cannot delete post"
      });
    }
    return response.status(200).json(post);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot delete post",
      error: (error as Error).message
    });
  }
}

export const searchPostController = async (request: AuthRequest, response: Response) => {
  try {
    const { query, page, limit } = request.query;
    const posts = await searchPostService(query as string, parseInt(page as string, 10), parseInt(limit as string, 10));
    if (!posts) {
      return response.status(400).json({
        message: "Cannot search posts"
      });
    }
    return response.status(200).json(posts);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot search posts",
      error: (error as Error).message
    });
  }
}
