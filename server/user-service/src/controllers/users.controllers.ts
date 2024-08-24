import { NextFunction, Request, Response } from "express";
import { Error } from "mongoose";
import { googleLoginService, loginService, refreshTokenService, registerService } from "../services/index.services";
import { verifyEmailService } from "../services/verify.services";

export const registerController = async (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;

  try {
    const newUser = await registerService({ name, email, password, confirmPassword });

    return res.status(201).json({
      message: "Register success",
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
    const token = await loginService({ email, password });

    return res.status(201).json({
      message: "Login success",
      token: token.token
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
