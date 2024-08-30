import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PRIVATE_KEY } from "./config";

export const verifyToken = (
  token: string | null | undefined
): string | JwtPayload | null => {
  if (token == null) return null;
  let result: string | JwtPayload | null = null;
  try {
    result = jwt.verify(token, JWT_PRIVATE_KEY);
  } catch (error) {
  } finally {
    return result;
  }
};
