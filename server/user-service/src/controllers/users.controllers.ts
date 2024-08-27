import { NextFunction, Request, Response } from "express";
import { Error } from "mongoose";
import UserModel from "../db/models/User.models";
import { InvalidDataError } from "../data/invalid_data.data";
import { searchUserByNameService, updateUserService } from "../services/users.services";
import { followAndUnFollowUserService } from "../services/follow.services";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new InvalidDataError({
        message: "Can't find this user!"
      })
    }
    res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
}

export const searchUserByNameController = async (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Name parameter is required" });
  }

  try {
    const users = await searchUserByNameService(name as string);
    res.json(users);
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
};

export const updateUserControler = async (req: Request, res: Response) => {
  try {
    const user = await updateUserService(req.params.userId, req.body);
    if (user) {
      return res.status(200).json({
        message: "Updated successfully!",
        user
      })
    }
    else {
      return res.status(400).json({
        message: "Updated fail!",
      })
    }
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
}

export const followAndUnFollowUserController = async (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.userId;
  const followId = req.params.id
  try {
    if (!currentUserId) {
      res.status(400).json({
        message: "Current user not found!",
      })
    }
    const result = await followAndUnFollowUserService(currentUserId as string, followId);
    if (result) {
      res.status(200).json({
        message: result,
      })
    }
    else {
      res.status(400).json({
        message: "Bad Request: Invalid action",
      })
    }
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
}
