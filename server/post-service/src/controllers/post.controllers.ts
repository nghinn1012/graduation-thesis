import e, { Request, Response } from "express";
import { createPostService, getPostService, updatePostService } from "../services/post.services";
import { AuthRequest, validatePostFoodBody } from "../data";

export const hello = (_request: Request, response: Response): Response => {
  return response.send("Hello from Post Service");
}

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
}

export const getPostController = async (request: Request, response: Response) => {
  try {
    const postId = request.params.id;
    console.log(postId);
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
      error: (error as Error).message
    });
  }
}
