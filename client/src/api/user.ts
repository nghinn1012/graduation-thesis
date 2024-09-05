import axios, { AxiosError } from "axios";
import { PROXY_URL, USER_PATH } from "../config/config";
import { ResponseErrorLike } from "../data/response_error_like";
import { ResponseLike } from "../data/respone_like";
import { UserErrorReason, UserErrorTarget } from "../data/user_error";

export const userEndpoints = {
  // users
  signup: "/users/register",
  verify: "/users/verifyUser",
  login: "users/login",
  refeshToken: "/users/refresh-token",
  loginWithGoogle: "/users/google-login",
} as const;

export interface UserResponseError
  extends ResponseErrorLike<UserErrorTarget, UserErrorReason> { }
export interface UserResponse<DataLike>
  extends ResponseLike<DataLike, UserResponseError> {
  token(token: any): unknown;
  user: any;
}

const userUrl = `${PROXY_URL}/${USER_PATH}`;

export const userInstance = axios.create({
  baseURL: userUrl,
  timeout: 2000,
});

userInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const response = error.response;
    if (typeof response?.data === "object") {
      const data = response.data as ResponseLike<
        unknown,
        ResponseErrorLike<unknown, unknown>
      >;
      return Promise.reject(data.error);
    }
    const _error: ResponseErrorLike<unknown, unknown> = {
      code: response?.status ?? 500,
      message: "",
    };
    return Promise.reject(_error);
  }
);

interface AccountInfo {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
  categories: string[];
  avatar?: string;
}

interface ManualRegisterInfo {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginInfo {
  email: string;
  password: string;
}


export interface UserFetcher {
  manualRegister(data: ManualRegisterInfo): Promise<UserResponse<AccountInfo>>;
  verifyEmail(token: string): Promise<UserResponse<AccountInfo>>;
  login(data: LoginInfo): Promise<UserResponse<AccountInfo>>;
  refreshToken(token: string): Promise<UserResponse<AccountInfo>>;
  loginWithGoogle(token: string): Promise<UserResponse<AccountInfo>>;
}

export const userFetcher: UserFetcher = {
  manualRegister: async (
    data: ManualRegisterInfo
  ): Promise<UserResponse<AccountInfo>> => {
    return userInstance.post(userEndpoints.signup, data);
  },
  verifyEmail: async (token: string): Promise<UserResponse<AccountInfo>> => {
    return userInstance.post(`${userEndpoints.verify}?token=${token}`);
  },
  login: async (data: LoginInfo): Promise<UserResponse<AccountInfo>> => {
    return userInstance.post(userEndpoints.login, data);
  },
  refreshToken: async (token: string): Promise<UserResponse<AccountInfo>> => {
    return userInstance.post(userEndpoints.refeshToken, { refreshToken: token });
  },
  loginWithGoogle: async (token: string): Promise<UserResponse<AccountInfo>> => {
    return userInstance.post(userEndpoints.loginWithGoogle, { idToken: token });
  },
};
