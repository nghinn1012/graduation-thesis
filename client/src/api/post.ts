import axios, { AxiosError } from "axios";
import { PROXY_URL, POST_PATH } from "../config/config";
import { ResponseErrorLike } from "../data/response_error_like";
import { ResponseLike } from "../data/respone_like";
import { UserErrorReason, UserErrorTarget } from "../data/user_error";

export const postEndpoints = {
  // users
  createPost: "/posts/create",
  getAllPosts: "/posts",
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
  timeout: 10000,
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

export interface PostInfo {
  _id: string;
  title: string;
  author: string;
  images: string[];
  hashtags: string[];
  timeToTake: string;
  servings: string;
  ingredients: Ingredient[];
  instructions: InstructionInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface InstructionInfo {
  step: number;
  description: string;
  image?: string;
}

export interface createPostInfo extends Omit<PostInfo, '_id' | 'author' | 'createdAt' | 'updatedAt' | 'instructions'> {
  instructions: {
    description: string;
    image?: string;
  }[];
}

export interface Ingredient {
  name: string;
  quantity: string;
}

type PartialInstructionInfo = Partial<InstructionInfo> & {
  description: string;
};

export interface PostFetcher {
  createPost: (data: createPostInfo, token: string) => Promise<PostResponse<createPostInfo>>;
  getAllPosts: (token: string) => Promise<PostResponse<PostInfo[]>>;
}

export const postFetcher: PostFetcher = {
  createPost: async (data: createPostInfo, token: string): Promise<PostResponse<createPostInfo>> => {
    return postInstance.post(postEndpoints.createPost, data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
  getAllPosts: async (token: string): Promise<PostResponse<PostInfo[]>> => {
    return postInstance.get(postEndpoints.getAllPosts,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  }
};
