import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_PRIVATE_KEY, JWT_EXPIRES_IN } from "../config/users.config";

export const signToken = (payload: string | object | Buffer, expiresIn: string | number = JWT_EXPIRES_IN): string => {
    const token = jwt.sign({
        data: payload
    }, JWT_PRIVATE_KEY, {
        expiresIn: expiresIn
    });
    return token;
};

export const verifyToken = (token: string | null | undefined): string | JwtPayload | null => {
    if (token == null) return null;
    let result: string | JwtPayload | null = null;
    try {
        result = jwt.verify(token, JWT_PRIVATE_KEY);
    } catch (error) {
    } finally {
        return result;
    }
}
