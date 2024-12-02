import { Request, Response } from "express";
import { Error } from "mongoose";
import { verifyEmailService, googleLoginService, loginService, refreshTokenService, registerService, ManualAccountRegisterInfo } from "../services/index.services";
import { forgotPassword, resendEmailVerify, updatePassword } from "../services/register.services";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password, name, confirmPassword } = req.body;
  const userData: ManualAccountRegisterInfo = { email, password, name, confirmPassword };

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
      message: 'Email verification failed',
      error: (error as Error).message,
    });
  }
};

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await resendEmailVerify(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: (error as Error).message,
    });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await forgotPassword(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: (error as Error).message,
    });
  }
}

export const updatePasswordController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {password, confirmPassword} = req.body;
    const userId = req.userId;
    console.log(userId);
    if (!userId) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const result = await updatePassword(userId, password, confirmPassword);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: (error as Error).message,
    });
  }
}
