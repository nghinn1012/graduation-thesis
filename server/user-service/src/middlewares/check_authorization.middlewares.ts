import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_PRIVATE_KEY } from '../config/users.config';

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_PRIVATE_KEY);
    if (req.params.userId == decoded.data.userId) {
      next();
    }
    else {
      res.status(401).json({ message: 'Unauthorized: Not have access to update data' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};
