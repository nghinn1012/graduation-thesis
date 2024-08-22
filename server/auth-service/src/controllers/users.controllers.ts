import { NextFunction, Request, Response } from "express";
import { Error } from "mongoose";
import { googleLoginService, loginService, registerService } from "../services/users.services";

export const registerController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await registerService({ name, email, password });

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
