require("dotenv").config();

export const PORT = +(process.env.PORT || 5000) as number;
export const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY as string;
export const EXCHANGE_NAME = process.env.EXCHANGE_NAME as string;
export const AMQP_PATH = process.env.AMQP_PATH as string;
export const RPC_QUEUE_NAME = process.env.RPC_QUEUE_NAME as string;
export const RPC_REQUEST_TIME_OUT = +(process.env.RPC_REQUEST_TIME_OUT || 2000) as number;

export const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE as string;
export const USER_SERVICE = process.env.USER_SERVICE as string;
export const POST_SERVICE = process.env.POST_SERVICE as string;
export const GATEWAY_SERVICE = process.env.GATEWAY_SERVICE as string;

export const USER_SERVICE_RPC_QUEUE = process.env.USER_SERVICE_RPC_QUEUE as string;
export const NOTIFICATION_SERVICE_RPC_QUEUE = process.env.NOTIFICATION_SERVICE_RPC_QUEUE as string;
export const POST_SERVICE_RPC_QUEUE = process.env.POST_SERVICE_RPC_QUEUE as string;
export const GATEWAY_SERVICE_RPC_QUEUE = process.env.GATEWAY_SERVICE_RPC_QUEUE as string;
