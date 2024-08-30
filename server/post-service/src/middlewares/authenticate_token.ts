import { NextFunction, Request, Response } from "express";
import { IAuthContent, UnauthorizationError } from "../data";
import { AuthRequest } from "../data/interface/auth_interface";
import jwt from "jsonwebtoken";
import { JWT_PRIVATE_KEY } from "../config/post.config";

export const tokenValidate = (request: AuthRequest, _response: Response, next: NextFunction) => {
  console.log(request.headers.authorization?.split(" ")[1]);
  const jsonToken = request.headers.authorization?.split(" ")[1];
  console.log(jsonToken);
  if (!jsonToken) {
    return next(new UnauthorizationError({
      message: "No token found",
      data: {
        reason: "no-token-found o tren",
        target: "token"
      }
    }))
  }
  try {
    const decoded = jwt.verify(jsonToken, JWT_PRIVATE_KEY) as IAuthContent;
    console.log(decoded);
    if (!decoded.data.userId || !decoded.data.email) {
      return next(new UnauthorizationError({
        message: "Invalid token",
        data: {
          reason: "invalid-token",
          target: "token"
        }
      }));
    }
    request.authContent = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizationError({
      message: "No token found",
      data: {
        reason: (error as Error).message,
        target: "token"
      }
    }))
  }
}
