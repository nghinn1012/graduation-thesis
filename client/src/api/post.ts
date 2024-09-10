import axios, { AxiosError } from "axios";
import { PROXY_URL, POST_PATH } from "../config/config";
import { ResponseErrorLike } from "../data/response_error_like";
import { ResponseLike } from "../data/respone_like";
import { UserErrorReason, UserErrorTarget } from "../data/user_error";
import { get } from "http";

export const postEndpoints = {
  // users
  createPost: "/posts/create",
  getAllPosts: "/posts",
  updatePost: "/posts/:id",
  getPostById: "/posts/:id",
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
  about: string;
  author: string;
  images: string[];
  hashtags: string[];
  timeToTake: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: InstructionInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface PostInfoUpdate {
  title?: string;
  about?: string;
  images?: string[];
  hashtags?: string[];
  timeToTake?: string;
  servings?: number;
  ingredients?: Ingredient[];
  instructions?: InstructionInfoUpdate[];
}

export interface InstructionInfoUpdate {
  description: string;
  image?: string;
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

export interface PostFetcher {
  createPost: (data: createPostInfo, token: string) => Promise<PostResponse<createPostInfo>>;
  getAllPosts: (token: string) => Promise<PostResponse<PostInfo[]>>;
  updatePost: (postId: string, data: PostInfoUpdate, token: string) => Promise<PostResponse<PostInfo>>;
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
  },
  updatePost: async (postId: string, data: PostInfoUpdate, token: string): Promise<PostResponse<PostInfo>> => {
    return postInstance.patch(postEndpoints.updatePost.replace(":id", postId), data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
};
