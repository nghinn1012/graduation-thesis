import axios, { AxiosError } from "axios";
import { PROXY_URL, POST_PATH } from "../config/config";
import { ResponseErrorLike } from "../data/response_error_like";
import { ResponseLike } from "../data/respone_like";
import { UserErrorReason, UserErrorTarget } from "../data/user_error";

export const postEndpoints = {
  //comment
  getCommentByPostId: "/posts/:postId/comment",
  createComment: "/posts/:postId/comment",
  updateComment: "/posts/:commentId/comment",
  deleteComment: "/posts/:commentId/comment",
  likeOrUnlikeComment: "/posts/:commentId/likeComment",

  // posts
  createPost: "/posts/create",
  getAllPosts: "/posts",
  updatePost: "/posts/:id",
  getPostById: "/posts/:id",
  deletePost: "/posts/:id",
  likeOrUnlikePost: "/posts/:id/like",
  getPostLikesByUser: "/posts/likes",
  savedOrUnsavedPost: "/posts/:id/save",
  getPostSavedByUser: "/posts/savedList",
  isLikedPostByUser: "/posts/:id/isLiked",
  isSavedPostByUser: "/posts/:id/isSaved",

  //recipe
  createMadeRecipe: "/posts/:id/made",
  getMadeRecipeOfPost: "/posts/:id/getMades",
  updateMadeRecipe: "/posts/:madeRecipeId/made",
  getMadeRecipeById: "/posts/:madeRecipeId/made",
  deleteMadeRecipe: "/posts/:madeRecipeId/made",
} as const;

export interface PostResponseError
  extends ResponseErrorLike<UserErrorTarget, UserErrorReason> { }
export interface PostResponse<DataLike>
  extends ResponseLike<DataLike, PostResponseError> {
  replies: Comment[] | undefined;
  token(token: any): unknown;
  liked: boolean;
  saved: boolean;
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
  likeCount: number;
  savedCount: number;
  createdAt: string;
  updatedAt: string;
  liked: boolean;
  saved: boolean;
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

export interface createPostInfo extends Omit<PostInfo, 'saved' | '_id' | 'author' | 'createdAt' | 'updatedAt' | 'instructions' | 'liked' | 'likeCount' | 'savedCount'> {
  instructions: {
    description: string;
    image?: string;
  }[];
}

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface PostLikeResponse {
  saved: boolean;
  liked: boolean;
}

export interface PostLikesByUser {
  ids: string[];
}

export interface createMadeInfo {
  image: string;
  review: string;
  rating: number;
}

export interface MadePostData {
  _id: string;
  userId: string;
  postId: string;
  image: string;
  review: string;
  rating: string;
  createdAt: Date;
  author: {
    _id: string;
    name: string;
    avatar: string;
    email: string;
    username: string;
  };
}

export interface MadePostUpdate {
  image?: string;
  review?: string;
  rating?: number;
}

export interface Comment {
  _id: string;
  author: {
    _id: string;
    username: string;
    avatar: string;
    name: string;
  };
  content: string;
  userMention: {
    _id: string;
    username: string;
  }
  createdAt: string;
  likes: string[];
  replies?: Comment[];
}

export interface createCommentData {
  content: string;
  parentCommentId?: string | null;
  userMention?: string;
}

export interface CommentAuthor {
  _id: string;
  username: string;
  name: string;
  avatar: string;
}

export interface updateComment {
  content?: string;
  userMention?: string | null;
  parentCommentId?: string;
}
export interface PostFetcher {
  // posts
  createPost: (data: createPostInfo, token: string) => Promise<PostResponse<createPostInfo>>;
  getAllPosts: (token: string, page: number, limit: number) => Promise<PostResponse<PostInfo[]>>;
  updatePost: (postId: string, data: PostInfoUpdate, token: string) => Promise<PostResponse<PostInfo>>;
  getPostById: (postId: string, token: string) => Promise<PostResponse<PostInfo>>;
  deletePost: (postId: string, token: string) => Promise<PostResponse<PostInfo>>;
  likeOrUnlikePost: (postId: string, token: string) => Promise<PostResponse<PostLikeResponse>>;
  postLikesByUser: (token: string) => Promise<PostResponse<PostLikesByUser>>;
  postSavedOrUnsaved: (postId: string, token: string) => Promise<PostResponse<PostLikeResponse>>;
  postSavedByUser: (token: string) => Promise<PostResponse<PostLikesByUser>>;
  isLikedPostByUser: (postId: string, token: string) => Promise<PostResponse<PostLikeResponse>>;
  isSavedPostByUser: (postId: string, token: string) => Promise<PostResponse<PostLikeResponse>>;

  //recipe
  createMadeRecipe: (postId: string, token: string, data: createMadeInfo) => Promise<PostResponse<PostLikeResponse>>;
  getMadeRecipeOfPost: (postId: string, token: string) => Promise<PostResponse<MadePostData>>;
  updateMadeRecipe: (madeRecipeId: string, data: MadePostUpdate, token: string) => Promise<PostResponse<MadePostUpdate>>;
  getMadeRecipeById: (madeRecipeId: string, token: string) => Promise<PostResponse<MadePostData>>;
  deleteMadeRecipe: (madeRecipeId: string, token: string) => Promise<PostResponse<MadePostData>>;

  //comment
  getCommentByPostId: (postId: string, token: string) => Promise<PostResponse<Comment[]>>;
  createComment: (postId: string, data: createCommentData, token: string) => Promise<PostResponse<Comment>>;
  updateComment: (commentId: string, data: updateComment, token: string) => Promise<PostResponse<Comment>>;
  deleteComment: (commentId: string, token: string) => Promise<PostResponse<Comment>>;
  likeOrUnlikeComment: (commentId: string, token: string) => Promise<PostResponse<Comment>>;
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
  },
  likeOrUnlikePost: async (postId: string, token: string): Promise<PostResponse<PostLikeResponse>> => {
    return postInstance.post(postEndpoints.likeOrUnlikePost.replace(":id", postId), {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
  postLikesByUser: async (token: string): Promise<PostResponse<PostLikesByUser>> => {
    return postInstance.get(postEndpoints.getPostLikesByUser,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
  postSavedOrUnsaved: async (postId: string, token: string): Promise<PostResponse<PostLikeResponse>> => {
    return postInstance.post(postEndpoints.savedOrUnsavedPost.replace(":id", postId), {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
  postSavedByUser: async (token: string): Promise<PostResponse<PostLikesByUser>> => {
    return postInstance.get(postEndpoints.getPostSavedByUser,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
  isLikedPostByUser: async (postId: string, token: string): Promise<PostResponse<PostLikeResponse>> => {
    return postInstance.get(postEndpoints.isLikedPostByUser.replace(":id", postId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
  isSavedPostByUser: async (postId: string, token: string): Promise<PostResponse<PostLikeResponse>> => {
    return postInstance.get(postEndpoints.isSavedPostByUser.replace(":id", postId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
  createMadeRecipe: async (postId: string, token: string, data: createMadeInfo): Promise<PostResponse<PostLikeResponse>> => {
    return postInstance.post(postEndpoints.createMadeRecipe.replace(":id", postId), data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  getMadeRecipeOfPost: async (postId: string, token: string): Promise<PostResponse<MadePostData>> => {
    return postInstance.get(postEndpoints.getMadeRecipeOfPost.replace(":id", postId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  updateMadeRecipe: async (madeRecipeId: string, data: MadePostUpdate, token: string): Promise<PostResponse<MadePostUpdate>> => {
    return postInstance.patch(postEndpoints.updateMadeRecipe.replace(":madeRecipeId", madeRecipeId), data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  getMadeRecipeById: async (madeRecipeId: string, token: string): Promise<PostResponse<MadePostData>> => {
    return postInstance.get(postEndpoints.getMadeRecipeById.replace(":madeRecipeId", madeRecipeId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  deleteMadeRecipe: async (madeRecipeId: string, token: string): Promise<PostResponse<MadePostData>> => {
    return postInstance.delete(postEndpoints.deleteMadeRecipe.replace(":madeRecipeId", madeRecipeId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  getCommentByPostId: async (postId: string, token: string): Promise<PostResponse<Comment[]>> => {
    return postInstance.get(postEndpoints.getCommentByPostId.replace(":postId", postId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  createComment: async (postId: string, data: createCommentData, token: string): Promise<PostResponse<Comment>> => {
    return postInstance.post(postEndpoints.createComment.replace(":postId", postId), data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  updateComment: async (commentId: string, data: updateComment, token: string): Promise<PostResponse<Comment>> => {
    return postInstance.patch(postEndpoints.updateComment.replace(":commentId", commentId), data,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  deleteComment: async (commentId: string, token: string): Promise<PostResponse<Comment>> => {
    return postInstance.delete(postEndpoints.deleteComment.replace(":commentId", commentId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  likeOrUnlikeComment: async (commentId: string, token: string): Promise<PostResponse<Comment>> => {
    return postInstance.post(postEndpoints.likeOrUnlikeComment.replace(":commentId", commentId), {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
}
