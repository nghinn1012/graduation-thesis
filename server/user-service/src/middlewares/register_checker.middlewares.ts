import { Request, Response, NextFunction } from 'express';
import { validateEmail, validatePassword } from '../data/validation.data';

export const validateRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    await validateEmail(email);
    await validatePassword(password);
    next();
  } catch (error) {
    res.status(400).json({
      message: "Validation failed",
      error: (error as Error).message
    });
  }
};
