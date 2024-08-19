require('dotenv').config();

export const USER_PORT = process.env.USER_PORT as string;
export const MONGO_LOCAL_URI = process.env.MONGODB_LOCAL_URI as string;
