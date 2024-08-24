import jwt from 'jsonwebtoken';
import UserModel from '../db/models/User.models';
import { InvalidDataError } from '../data/index.data';
import { JWT_PRIVATE_KEY } from '../config/users.config';

export const verifyEmailService = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_PRIVATE_KEY) as { data: { email: string } };

    const user = await UserModel.findOne({ email: decoded.data.email });

    if (!user) {
      throw new InvalidDataError({
        message: "User not found"
      });
    }

    user.verify = 1;
    await user.save();

    return user;
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message || 'Email verification failed'
    });
  }
};
