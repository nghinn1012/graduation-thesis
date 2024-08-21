require('dotenv').config();

export const USER_PORT = process.env.USER_PORT as string;
export const MONGO_LOCAL_URI = process.env.MONGO_LOCAL_URI as string;
export const SALT_NUM = +(process.env.SALT_NUM || 10) as number;
export const JWT_PRIVATE_KEY = (process.env.JWT_PRIVATE_KEY || "json-web-token") as string;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
export const EXCHANGE_NAME = process.env.EXCHANGE_NAME as string;
export const USER_SERVICE = process.env.USER_SERVICE as string;
export const AMQP_PATH = process.env.AMQP_PATH as string;
export const RPC_QUEUE_NAME = process.env.RPC_QUEUE_NAME as string;
export const RPC_REQUEST_TIME_OUT = +(process.env.RPC_REQUEST_TIME_OUT || 2000) as number;
