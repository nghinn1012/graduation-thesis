import { NextFunction, Request, Response } from "express";
import { validateEmail, validatePassword } from "../data/index.data";

export const checkLoginBodyAndParams = async (request: Request, res: Response, next: NextFunction) => {
  const { email, password } = request.body;
  try {
    validateEmail(email);
    validatePassword(password);
    next();
  } catch (error) {
    res.status(400).json({
      message: "Validation failed",
      error: (error as Error).message
    });
  }
}