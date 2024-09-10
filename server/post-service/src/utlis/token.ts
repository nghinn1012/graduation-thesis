import { IAuthContent, UnauthorizationError, AuthRequest } from "../data";
import jwt from "jsonwebtoken";
import { JWT_PRIVATE_KEY } from "../config/post.config";

export const verifyToken = (request: AuthRequest): IAuthContent => {
  const jsonToken = request.headers.authorization?.split(" ")[1];
  if (jsonToken == undefined) {
    throw new UnauthorizationError({
      message: "No token found",
      data: {
        reason: "no-token-found",
        target: "token",
      },
    });
  }

  try {
    const decoded = jwt.verify(jsonToken, JWT_PRIVATE_KEY) as IAuthContent;
    if (!decoded.data.userId || !decoded.data.email) {
      throw new UnauthorizationError({
        message: "Invalid token check server",
        data: {
          reason: "invalid-token",
          target: "token",
        },
      });
    }

    return decoded;
  } catch (error) {
    throw new UnauthorizationError({
      message: (error as Error).message,
    });
  }
};
