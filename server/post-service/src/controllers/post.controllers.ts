import { Request, Response } from "express";
import { createPostService, getAllPostsService, getPostService, updatePostService } from "../services/post.services";
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
    console.log(post);
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
    const posts = await getAllPostsService();
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
