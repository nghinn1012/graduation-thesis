import { NextFunction, Request, Response } from "express";
import { Error } from "mongoose";
import { verifyEmailService, googleLoginService, loginService, refreshTokenService, registerService, ManualAccountRegisterInfo } from "../services/index.services";
import UserModel from "../db/models/User.models";
import { InvalidDataError } from "../data/invalid_data.data";

export const registerController = async (req: Request, res: Response) => {
  const { email, password, name, confirmPassword, username, avatar, coverImage, bio } = req.body;
  const userData: ManualAccountRegisterInfo = { email, password, name, confirmPassword, username, avatar, coverImage, bio };
  
  try {
    const newUser = await registerService(userData);

    return res.status(201).json({
      message: "Register success. A verify email sent to your mail address",
      user: newUser
    });
  } catch (error) {
    return res.status(400).json({
      message: "Register failed",
      error: (error as Error).message
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { token, refreshToken, ...user } = await loginService({ email, password });

    return res.status(201).json({
      message: "Login success",
      token,
      user: user
    });
  } catch (error) {
    return res.status(400).json({
      message: "Login failed",
      error: (error as Error).message
    });
  }
}


export const googleLoginController = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    const userData = await googleLoginService(idToken);
    return res.status(200).json(userData);
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
};

export const refreshTokenController = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    const newToken = await refreshTokenService(refreshToken);
    res.json(newToken);
  } catch (error) {
    console.error('Error during token refresh:', error);
    res.status(400).json({ message: 'Could not refresh token' });
  }
}

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const user = await verifyEmailService(token as string);
    res.status(200).json({ message: 'Email verified successfully', user });
  } catch (error) {
    return res.status(400).json({
      error: (error as Error).message,
    });
  }
};
