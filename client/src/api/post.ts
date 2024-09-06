import axios, { AxiosError } from "axios";
import { PROXY_URL, POST_PATH } from "../config/config";
import { ResponseErrorLike } from "../data/response_error_like";
import { ResponseLike } from "../data/respone_like";
import { UserErrorReason, UserErrorTarget } from "../data/user_error";

export const postEndpoints = {
  // users
  createPost: "/posts/create",
} as const;

export interface PostResponseError
  extends ResponseErrorLike<UserErrorTarget, UserErrorReason> { }
export interface PostResponse<DataLike>
  extends ResponseLike<DataLike, PostResponseError> {
  token(token: any): unknown;
  user: any;
}

const userUrl = `${PROXY_URL}/${POST_PATH}`;

export const postInstance = axios.create({
  baseURL: userUrl,
  timeout: 2000,
});

postInstance.interceptors.response.use(
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
export interface InstructionInfo {
  description: string;
  image?: string;
}

export interface IngredientInfo {
  name: string;
  quantity: string;
}

export interface PostInfo {
  title: string;
  images: string[];
  instructions: InstructionInfo[];
  ingredients: IngredientInfo[];
  hashtags: string[];
  timeToTake: number;
  servings: number;
}

export interface PostFetcher {
  createPost: (data: PostInfo, token: string) => Promise<PostResponse<PostInfo>>;
}

export const postFetcher: PostFetcher = {
  createPost: async (data: PostInfo, token: string): Promise<PostResponse<PostInfo>> => {
    return postInstance.post(postEndpoints.createPost, data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
};
