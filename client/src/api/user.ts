import axios, { AxiosError } from "axios";
import { PROXY_URL, USER_PATH } from "../config/config";
import { ResponseErrorLike } from "../data/response_error_like";
import { ResponseLike } from "../data/respone_like";
import { UserErrorReason, UserErrorTarget } from "../data/user_error";

export const userEndpoints = {
  // users
  signup: "/users/register",
  verify: "/users/verifyUser",
  resendVerify: "/users/resend-verify",
  resetPassword: "/users/reset-password",
  updatePassword: "/users/update-password",
  login: "/users/login",
  refeshToken: "/users/refresh-token",
  loginWithGoogle: "/users/google-login",
  getUserById: "/users/getUser",
  getAllUsers: "/users",
  search: "/users/search",
  suggest: "/users/suggest",
  follow: "/users/followUser/:userId",
  getFollowers: "/users/followers/:userId",
  getFollowing: "/users/following/:userId",
  updateUser: "/users/update/:userId",
  banned: "/users/banned/:userId",
} as const;

export interface UserResponseError
  extends ResponseErrorLike<UserErrorTarget, UserErrorReason> {}
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

export interface AccountInfo {
  _id: string;
  email: string;
  name: string;
  username: string;
  token: string;
  avatar?: string;
  refreshToken: string;
  followers: string[];
  following: string[];
  followed: boolean;
  followingData?: AccountInfo[];
  followersData?: AccountInfo[];
  coverImage?: string;
  bio?: string;
  postCount?: number;
}

interface ManualRegisterInfo {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInfo {
  email: string;
  password: string;
  role?: string;
}

export interface searchInfoData {
  users: AccountInfo[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface UpdateDataInfo {
  password: string;
  name: string;
  confirmPassword: string;
  username: string;
  avatar: string;
  coverImage: string;
  bio: string;
}

export interface PostAuthor {
  _id: string;
  name: string;
  email: string;
  username: string;
  avatar: string;
  followers: string[];
  followed: boolean;
}

export interface FollowData {
  message: string;
  user: AccountInfo;
}

export interface UserFetcher {
  manualRegister(data: ManualRegisterInfo): Promise<UserResponse<AccountInfo>>;
  verifyEmail(token: string): Promise<UserResponse<AccountInfo>>;
  login(data: LoginInfo): Promise<UserResponse<AccountInfo>>;
  refreshToken(token: string): Promise<UserResponse<AccountInfo>>;
  resendVerifyEmail(email: string): Promise<UserResponse<AccountInfo>>;
  resetPassword(email: string): Promise<UserResponse<AccountInfo>>;
  updatePassword(password: string, confirmPassword: string, token: string): Promise<UserResponse<AccountInfo>>;
  loginWithGoogle(token: string): Promise<UserResponse<AccountInfo>>;
  getUserById(id: string, token: string): Promise<UserResponse<AccountInfo>>;
  getAllUsers(token: string): Promise<UserResponse<AccountInfo[]>>;
  search(
    name: string,
    page: number,
    pageSize: number,
    token: string
  ): Promise<UserResponse<searchInfoData>>;
  suggest(token: string): Promise<UserResponse<AccountInfo[]>>;
  followUser(userId: string, token: string): Promise<UserResponse<FollowData>>;
  getFollowers(
    userId: string,
    token: string
  ): Promise<UserResponse<AccountInfo>>;
  getFollowing(
    userId: string,
    token: string
  ): Promise<UserResponse<AccountInfo>>;
  updateUser(
    userId: string,
    data: UpdateDataInfo,
    token: string
  ): Promise<UserResponse<AccountInfo>>;
  banned(userId: string, token: string): Promise<UserResponse<AccountInfo>>;
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
    return userInstance.post(
      userEndpoints.refeshToken,
      { refreshToken: token },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  loginWithGoogle: async (
    token: string
  ): Promise<UserResponse<AccountInfo>> => {
    return userInstance.post(userEndpoints.loginWithGoogle, { idToken: token });
  },
  getUserById: async (
    id: string,
    token: string
  ): Promise<UserResponse<AccountInfo>> => {
    return userInstance.get(`${userEndpoints.getUserById}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  getAllUsers: async (token: string): Promise<UserResponse<AccountInfo[]>> => {
    return userInstance.get(userEndpoints.getAllUsers, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  search: async (
    name: string,
    page: number,
    pageSize: number,
    token: string
  ): Promise<UserResponse<searchInfoData>> => {
    return userInstance.get(userEndpoints.search, {
      params: {
        name,
        page,
        pageSize,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  suggest: async (token: string): Promise<UserResponse<AccountInfo[]>> => {
    return userInstance.get(userEndpoints.suggest, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  followUser: async (
    userId: string,
    token: string
  ): Promise<UserResponse<FollowData>> => {
    return userInstance.post(
      userEndpoints.follow.replace(":userId", userId),
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  getFollowers: async (
    userId: string,
    token: string
  ): Promise<UserResponse<AccountInfo>> => {
    return userInstance.get(
      userEndpoints.getFollowers.replace(":userId", userId),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  getFollowing: async (
    userId: string,
    token: string
  ): Promise<UserResponse<AccountInfo>> => {
    return userInstance.get(
      userEndpoints.getFollowing.replace(":userId", userId),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  updateUser: async (
    userId: string,
    data: UpdateDataInfo,
    token: string
  ): Promise<UserResponse<AccountInfo>> => {
    return userInstance.patch(
      userEndpoints.updateUser.replace(":userId", userId),
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  resendVerifyEmail: async (
    email: string,
  ): Promise<UserResponse<AccountInfo>> => {
    return userInstance.post(
      userEndpoints.resendVerify,
      { email }
    );
  },
  resetPassword: async (
    email: string,
  ): Promise<UserResponse<AccountInfo>> => {
    return userInstance.post(
      userEndpoints.resetPassword,
      { email }
    );
  },
  updatePassword: async (
    password: string,
    confirmPassword: string,
    token: string,
  ): Promise<UserResponse<AccountInfo>> => {
    return userInstance.post(
      userEndpoints.updatePassword,
      { password, confirmPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
  banned: async (
    userId: string,
    token: string
  ): Promise<UserResponse<AccountInfo>> => {
    return userInstance.post(
      userEndpoints.banned.replace(":userId", userId),
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};
