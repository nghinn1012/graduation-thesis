const env = import.meta.env;

export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID as string;

export const PROXY_URL = env.VITE_PROXY_URL as string;
export const USER_PATH = env.VITE_USER_PATH as string;
export const NOTIFICATION_PATH = env.VITE_NOTIFICATION_PATH as string;
export const POST_PATH = env.VITE_POST_PATH as string;
export const VITE_SOCKET_POST_URL = env.VITE_SOCKET_POST_URL as string;
