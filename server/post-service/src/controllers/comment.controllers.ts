import { AuthRequest } from "../data";
import { createCommentService, deleteCommentService, getCommentByIdService, getCommentByPostIdService, likeOrUnlikeCommentService, updateCommentService } from "../services/comment.services";
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
      error: error as Error
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

export const updateCommentController = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Cannot update comment"
      });
    }
    const commentData = req.body;
    const comment = await updateCommentService(userId, commentId, commentData);
    return res.status(200).json(comment);
  }
  catch (error) {
    return res.status(400).json({
      message: "Cannot update comment",
      error: (error as Error)
    });
  }
}

export const deleteCommentController = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Cannot delete comment"
      });
    }
    const comment = await deleteCommentService(userId, commentId);
    return res.status(200).json(comment);
  }
  catch (error) {
    return res.status(400).json({
      message: "Cannot delete comment",
      error: (error as Error)
    });
  }
}

export const likeOrUnlikeCommentController = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.authContent?.data.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Cannot like or unlike comment"
      });
    }
    const comment = await likeOrUnlikeCommentService(userId, commentId);
    return res.status(200).json(comment);
  }
  catch (error) {
    return res.status(400).json({
      message: "Cannot like or unlike comment",
      error: (error as Error)
    });
  }
}
