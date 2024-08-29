require('dotenv').config();

export const USER_PORT = process.env.USER_PORT as string;
export const MONGO_LOCAL_URI = process.env.MONGO_LOCAL_URI as string;
export const SALT_NUM = +(process.env.SALT_NUM || 10) as number;
export const JWT_PRIVATE_KEY = (process.env.JWT_PRIVATE_KEY || "json-web-token") as string;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
export const GOOGLE_AUTHORIZED_REDIRECT_URI = process.env.GOOGLE_AUTHORIZED_REDIRECT_URI as string;
export const AC_PRIVATE_KEY = process.env.AC_PRIVATE_KEY as string;
export const RF_PRIVATE_KEY = process.env.RF_PRIVATE_KEY as string;

export const EXCHANGE_NAME = process.env.EXCHANGE_NAME as string;
export const AMQP_PATH = process.env.AMQP_PATH as string;
export const RPC_QUEUE_NAME = process.env.RPC_QUEUE_NAME as string;
export const RPC_REQUEST_TIME_OUT = +(process.env.RPC_REQUEST_TIME_OUT || 2000) as number;

export const USER_SERVICE = process.env.USER_SERVICE as string;
export const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE as string;
export const POST_SERVICE = process.env.POST_SERVICE as string;

export const USER_SERVICE_RPC_QUEUE = process.env.USER_SERVICE_RPC_QUEUE as string;
export const NOTIFICATION_SERVICE_RPC_QUEUE = process.env.NOTIFICATION_SERVICE_RPC_QUEUE as string;
export const POST_SERVICE_RPC_QUEUE = process.env.POST_SERVICE_RPC_QUEUE as string;

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME as string;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY as string;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET as string;
