import { Request, Response } from "express";
import { getPostByUserFollowingService, getPostLikesByUserService, getSavedPostsByUserService, isLikedPostByUserService, isSavedPostByUserService, likeOrUnlikePostService, saveOrUnsavedPostService } from "../services/postAction.service";
import { AuthRequest } from "../data";

export const likeOrUnlikePostController = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Can't like or unlike post without user validate"
      });
    }
    const result = await likeOrUnlikePostService(postId, userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: "Cannot like or unlike post",
      error: (error as Error).message
    });
  }
}

export const getPostLikesByUserController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.query.userId ? req.query.userId: req.authContent?.data.userId;
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    if (!userId) {
      return res.status(400).json({
        message: "Can't get post likes without user validate"
      });
    }
    const likes = await getPostLikesByUserService(userId as string, page, limit);
    return res.status(200).json(likes);
  } catch (error) {
    return res.status(400).json({
      message: "Cannot get post likes",
      error: (error as Error).message
    });
  }
}

export const saveOrUnsavedPostController = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Can't save or unsave post without user validate"
      });
    }
    const result = await saveOrUnsavedPostService(postId, userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: "Cannot save or unsave post",
      error: (error as Error).message
    });
  }
}

export const getSavedPostsByUserController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Can't get saved post without user validate"
      });
    }
    const result = await getSavedPostsByUserService(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      message: "Cannot get saved post",
      error: (error as Error).message
    });
  }
}

export const isLikedPostByUserController = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.id;
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Can't check liked post without user validate"
      });
    }
    const result = await isLikedPostByUserService(postId, userId);
    return res.status(200).json(result !== null);
  } catch (error) {
    return res.status(400).json({
      message: "Cannot check liked post",
      error: (error as Error).message
    });
  }
}

export const isSavedPostByUserController = async (request: AuthRequest, response: Response) => {
  try {
    const postId = request.params.id;
    const userId = request.authContent?.data.userId;
    if (!userId) {
      return response.status(400).json({
        message: "Can't check saved post without user validate"
      });
    }
    const result = await isSavedPostByUserService(postId, userId);
    return response.status(200).json(result);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot get post",
      error: (error as Error)
    });
  }
}

export const getPostByUserFollowingController = async (request: AuthRequest, response: Response) => {
  try {
    const userId = request.authContent?.data.userId;
    const page = request.query.page ? parseInt(request.query.page as string) : undefined;
    const limit = request.query.limit ? parseInt(request.query.limit as string) : undefined;
    if (!userId) {
      return response.status(400).json({
        message: "Can't get post by user following without user validate"
      });
    }
    const result = await getPostByUserFollowingService(userId, page, limit);
    return response.status(200).json(result);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot get post by user following",
      error: (error as Error).message
    });
  }
}
