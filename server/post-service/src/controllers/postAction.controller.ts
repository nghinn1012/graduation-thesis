import { Request, Response } from "express";
import { getPostLikesByUserService, getSavedPostsByUserService, likeOrUnlikePostService, saveOrUnsavedPostService } from "../services/postAction.service";
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
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Can't get post likes without user validate"
      });
    }
    const likes = await getPostLikesByUserService(userId);
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
