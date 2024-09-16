import { AuthRequest } from "../data";
import { createCommentService, getCommentByIdService, getCommentByPostIdService } from "../services/comment.services";
import { Response } from "express";

export const createCommentController = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.postId;
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Cannot create comment"
      });
    }
    const commentData = req.body;
    const comment = await createCommentService(postId, userId, commentData);
    return res.status(201).json(comment);
  }
  catch (error) {
    return res.status(400).json({
      message: "Cannot create comment",
      error: (error as Error).message
    });
  }
}

export const getCommentByPostIdController = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.postId;
    const comments = await getCommentByPostIdService(postId);
    return res.status(200).json(comments);
  }
  catch (error) {
    return res.status(400).json({
      message: "Cannot get comments",
      error: (error as Error).message
    });
  }
}

export const getCommentByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const comment = await getCommentByIdService(commentId);
    return res.status(200).json(comment);
  }
  catch (error) {
    return res.status(400).json({
      message: "Cannot get comment",
      error: (error as Error).message
    });
  }
}
