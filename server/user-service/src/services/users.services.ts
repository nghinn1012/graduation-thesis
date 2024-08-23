import UserModel from '../db/models/User.models';
import { validateEmail, validatePassword, InvalidDataError, InternalError } from '../data/index.data';
import { compareHash, hashText } from '../utlis/bcrypt';
import { signRefreshToken, signToken, verifyToken } from '../utlis/jwt';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID, JWT_PRIVATE_KEY } from '../config/users.config';
import { JwtPayload } from 'jsonwebtoken';
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface LoginInfo {
  email: string;
  password: string;
}

interface ManualAccountRegisterInfo {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

interface GooglePayload {
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}


export const registerService = async (info: ManualAccountRegisterInfo) => {
  try {
    const { email, password, name, confirmPassword } = info;
    const existingUser = await UserModel.findOne({ email: email })
    if (existingUser) {
      throw new InvalidDataError({
        message: "User already exist"
      });
    }
    await validateEmail(email);
    await validatePassword(password);

    if (password !== confirmPassword) {
      throw new InvalidDataError({
        message: "Password is not match"
      });
    }

    const hashedPassword = await hashText(password);

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword
    });

    return newUser;
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message
    });
  }
};

export const loginService = async (info: LoginInfo) => {
  const { email, password } = info;

  const user = await UserModel.findOne({ email: email });
  if (user === null) {
    throw new InvalidDataError({
      message: "Invalid email or password"
    });
  }

  const isPasswordValid = await compareHash(password, user.password);
  if (!isPasswordValid) {
    throw new InvalidDataError({
      message: "Invalid email or password"
    });
  }

  const token = signToken({ userId: user._id });
  const refreshToken = signRefreshToken({ userId: user._id });

  user.refreshToken = refreshToken;
  await user.save();

  return {
    ...user.toJSON(),
    token,
    refreshToken,
  };
};

export const googleLoginService = async (idToken: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload() as GooglePayload;

    if (!payload || !payload.email_verified) {
      throw new InvalidDataError({ message: 'Google authentication failed' });
    }

    const { email, name } = payload;

    if (!email || !name) {
      throw new InvalidDataError({ message: 'Missing email or name from Google account' });
    }

    let user = await UserModel.findOne({ email });

    const token = signToken({ userId: user?._id });
    const refreshToken = signRefreshToken({ userId: user?._id });

    if (user) {
      user.refreshToken = refreshToken;
      await user.save();

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
        refreshToken,
      };
    } else {
      const password = await hashText(JWT_PRIVATE_KEY);

      const newUser = new UserModel({
        name,
        email,
        password,
        refreshToken,
      });

      await newUser.save();

      return {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        token,
        refreshToken,
      };
    }
  } catch (error) {
    throw new InvalidDataError({
      message: (error as Error).message || 'Google login failed',
    });
  }
};

export const refreshTokenService = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_PRIVATE_KEY) as { userId: string };
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      throw new InvalidDataError({
        message: "User not found"
      });
    }

    const newToken = signToken({ userId: user._id });
    const newRefreshToken = signRefreshToken({ userId: user._id });

    user.refreshToken = newRefreshToken;
    await user.save();

    return { token: newToken };
  } catch (error) {
    throw new InvalidDataError({
      message: "Could not refresh token"
    });
  }
};
