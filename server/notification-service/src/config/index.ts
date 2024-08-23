require('dotenv').config();

export const NOTIFICATION_PORT = +(process.env.NOTIFICATION_PORT || 8080) as number;
export const MONGO_LOCAL_URI = process.env.MONGO_LOCAL_URI as string;

export const NODE_MAILER_SERVICE = process.env.NODE_MAILER_SERVICE as string;
export const NODE_MAILER_ALIAS = process.env.NODE_MAILER_ALIAS as string;
export const NODE_MAILER_PASSWORD = process.env.NODE_MAILER_PASSWORD as string;
export const NODE_MAILER_CONFIG_HOST = process.env.NODE_MAILER_CONFIG_HOST as string;
export const NODE_MAILER_CONFIG_PORT = +(process.env.NODE_MAILER_CONFIG_PORT || 465) as number;
export const NODE_MAILER_SENDER = process.env.NODE_MAILER_SENDER as string;
