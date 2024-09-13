import axios, { AxiosError } from "axios";
import { PROXY_URL, POST_PATH } from "../config/config";
import { ResponseErrorLike } from "../data/response_error_like";
import { ResponseLike } from "../data/respone_like";
import { UserErrorReason, UserErrorTarget } from "../data/user_error";

export const postEndpoints = {
  // users
  createPost: "/posts/create",
  getAllPosts: "/posts",
  updatePost: "/posts/:id",
  getPostById: "/posts/:id",
  deletePost: "/posts/:id",
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
  author: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
    username: string;
  };
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
  getAllPosts: (token: string, page: number, limit: number) => Promise<PostResponse<PostInfo[]>>;
  updatePost: (postId: string, data: PostInfoUpdate, token: string) => Promise<PostResponse<PostInfo>>;
  getPostById: (postId: string, token: string) => Promise<PostResponse<PostInfo>>;
  deletePost: (postId: string, token: string) => Promise<PostResponse<PostInfo>>;
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
  getAllPosts: async (token: string, page: number = 1, limit: number = 20): Promise<PostResponse<PostInfo[]>> => {
    try {
      // Gửi yêu cầu đến API với các tham số phân trang
      return postInstance.get(postEndpoints.getAllPosts, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          page,  // Tham số phân trang: trang hiện tại
          limit, // Tham số phân trang: số lượng bài viết mỗi trang
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch posts: ${(error as Error).message}`);
    }
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
  getPostById: async (postId: string, token: string): Promise<PostResponse<PostInfo>> => {
    return postInstance.get(postEndpoints.getPostById.replace(":id", postId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
  deletePost: async (postId: string, token: string): Promise<PostResponse<PostInfo>> => {
    return postInstance.delete(postEndpoints.deletePost.replace(":id", postId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  }
}
