import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utlis/token";
import { AuthRequest } from "../data";


export const tokenValidate = (
  request: AuthRequest,
  _response: Response,
  next: NextFunction
) => {
  try {
    const decoded = verifyToken(request);
    request.authContent = decoded;
    next();
  } catch (error) {
    return next(error);
  }
};
