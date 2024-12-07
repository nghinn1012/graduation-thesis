import { NextFunction, Request, Response } from "express";
import { Error } from "mongoose";
import UserModel from "../db/models/User.models";
import { InvalidDataError } from "../data/invalid_data.data";
import { followAndUnFollowUserService,
  getSuggestUserService, searchAndFilterUserService,
  updateUserService
} from "../services/index.services";
import { getFollowersService, getFollowingService } from "../services/follow.services";
import { banndedOrUnbanndedUserService } from "../services/users.services";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.userId;
    const user = await UserModel.findById(userId);
    const isFollowing = await UserModel.find({
      _id: userId,
      followers: { $in: [currentUserId] }
    });
    if (!user) {
      throw new InvalidDataError({
        message: "Can't find this user!"
      })
    }
    res.status(200).json({
      ...user.toJSON(),
      followed: isFollowing.length > 0,
    });
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
}

export const searchAndFilterUserController = async (req: AuthenticatedRequest, res: Response) => {
  const { name, page, pageSize } = req.query;
  const userId = req.userId;
  try {
    const users = await searchAndFilterUserService(name as string, userId as string, Number(pageSize), Number(page));
    res.json(users);
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
};

export const updateUserControler = async (req: Request, res: Response) => {
  try {
    const user = await updateUserService(req.params.id, req.body);
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
      res.status(200).json(result)
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

export const getSuggestUserController = async (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.userId;
  try {
    if (!currentUserId) {
      res.status(400).json({
        message: "Current user not found!",
      })
    }
    const users = await getSuggestUserService(currentUserId as string);
    if (users) {
      res.status(200).json(users)
    } else {
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

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
}

export const getFollowersController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const followers = await getFollowersService(userId);
    res.status(200).json(followers);
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
}

export const getFollowingController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const following = await getFollowingService(userId);
    res.status(200).json(following);
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
}

export const banndedOrUnbanndedUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const adminId = req.userId;
    if (!adminId) {
      res.status(400).json({
        message: "Admin not found!",
      })
    }
    const result = await banndedOrUnbanndedUserService(userId, adminId as string);
    res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
}
