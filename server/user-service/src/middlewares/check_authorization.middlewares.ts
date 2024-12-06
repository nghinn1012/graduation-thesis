import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_PRIVATE_KEY } from '../config/users.config';
import UserModel from '../db/models/User.models';

interface AuthenticatedRequest extends Request {
  userId?: string;
  role?: string;
}

export const protectedRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_PRIVATE_KEY);
    const currentUser = await UserModel.findById(decoded.data.userId);

    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized: Invalid user' });
    }

    req.userId = currentUser._id.toString();
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  await protectedRequest(req, res, async () => {
    const userIdFromParams = req.params.id;
    const userIdFromToken = req.userId;

    if (userIdFromParams == userIdFromToken) {
      next();
    } else {
      return res.status(401).json({
        message: 'Unauthorized: No access to update data',
        userIdFromParams,
        userIdFromToken,
      });
    }
  });
};

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};
