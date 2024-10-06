require('dotenv').config();

export const NOTIFICATION_PORT = +(process.env.NOTIFICATION_PORT || 8080) as number;
export const MONGO_LOCAL_URI = process.env.MONGO_LOCAL_URI as string;

export const NODE_MAILER_ALIAS = process.env.NODE_MAILER_ALIAS as string;
export const NODE_MAILER_PASSWORD = process.env.NODE_MAILER_PASSWORD as string;
export const NODE_MAILER_CONFIG_HOST = process.env.NODE_MAILER_CONFIG_HOST as string;
export const NODE_MAILER_CONFIG_PORT = +(process.env.NODE_MAILER_CONFIG_PORT || 587) as number;
export const NODE_MAILER_SENDER = process.env.NODE_MAILER_SENDER as string;

export const USER_SERVICE = process.env.USER_SERVICE as string;
export const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE as string;
export const POST_SERVICE = process.env.POST_SERVICE as string;

export const USER_SERVICE_RPC_QUEUE = process.env.USER_SERVICE_RPC_QUEUE as string;
export const NOTIFICATION_SERVICE_RPC_QUEUE = process.env.NOTIFICATION_SERVICE_RPC_QUEUE as string;
export const POST_SERVICE_RPC_QUEUE = process.env.POST_SERVICE_RPC_QUEUE as string;

export const EXCHANGE_NAME = process.env.EXCHANGE_NAME as string;
export const AMQP_PATH = process.env.AMQP_PATH as string;
export const RPC_QUEUE_NAME = process.env.RPC_QUEUE_NAME as string;
export const RPC_REQUEST_TIME_OUT = +(process.env.RPC_REQUEST_TIME_OUT || 2000) as number;

export const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY as string;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME as string;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY as string;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET as string;
