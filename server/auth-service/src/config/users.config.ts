require('dotenv').config();

export const USER_PORT = process.env.USER_PORT as string;
export const MONGO_LOCAL_URI = process.env.MONGO_LOCAL_URI as string;
export const SALT_NUM = +(process.env.SALT_NUM || 10) as number;
export const JWT_PRIVATE_KEY = (process.env.JWT_PRIVATE_KEY || "json-web-token") as string;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
