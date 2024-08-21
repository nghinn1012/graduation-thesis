import { Request, Response } from "express";
import { Error } from "mongoose";
import { registerService } from "../services/users.services";

export const registerController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const newUser = await registerService(name, email, password);

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
