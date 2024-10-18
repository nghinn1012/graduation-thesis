import axios, { AxiosError } from "axios";
import { PROXY_URL, POST_PATH } from "../config/config";
import { ResponseErrorLike } from "../data/response_error_like";
import { ResponseLike } from "../data/respone_like";
import { UserErrorReason, UserErrorTarget } from "../data/user_error";
import { AccountInfo } from "./user";

export const postEndpoints = {
  // product
  getAllProducts: "/posts/product/getAll",
  getCart: "/posts/product/getCart",
  getProductByPostId: "/posts/product/getProductByPostId/:postId",
  addProductToCart: "/posts/product/addToCart",
  removeProductFromCart: "/posts/product/removeProductFromCart/:productId",
  //mealPlanner
  addMeal: "/posts/mealPlanner/create",
  getMealPlanner: "/posts/mealPlanner/getAll",
  checkPostInUnscheduledMeal: "/posts/mealPlanner/checkPost/:postId",
  removeMeal: "/posts/mealPlanner/remove",
  scheduleMeal: "/posts/mealPlanner/scheduleMeal",
  //comment
  getCommentByPostId: "/posts/:postId/comment",
  createComment: "/posts/:postId/comment",
  updateComment: "/posts/:commentId/comment",
  deleteComment: "/posts/:commentId/comment",
  likeOrUnlikeComment: "/posts/:commentId/likeComment",

  // posts
  getPostByUserFollowing: "/posts/following",
  getPostOfUser: "/posts/:userId/getAllOfUser",
  createPost: "/posts/create",
  searchPost: "/posts/search",
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

  //shoppingList
  addIngredientToShoppingList: "/posts/shoppingList/add",
  updateIngredientInShoppingList: "/posts/shoppingList/update",
  getShoppingList: "/posts/shoppingList",
  checkIsPostInShoppingList: "/posts/shoppingList/:postId",
  removePostFromShoppingList: "/posts/shoppingList/:postId",
  removeIngredientFromShoppingList: "/posts/shoppingList/removeIngredient",
  removeIngredientsFromShoppingList: "/posts/shoppingList/removeIngredients",
} as const;

export interface PostResponseError
  extends ResponseErrorLike<UserErrorTarget, UserErrorReason> { }
export interface PostResponse<DataLike>
  extends ResponseLike<DataLike, PostResponseError> {
  filter: any;
  includes(arg0: string): any;
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
    followers: string[];
    followed?: boolean;
  };
  images: string[];
  hashtags: string[];
  timeToTake: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: InstructionInfo[];
  likeCount: number;
  savedCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  liked: boolean;
  saved: boolean;
  isInShoppingList: boolean;
  difficulty: string;
  course: string[];
  dietary: string[];
  hasProduct: boolean;
  product?: ProductInfo;
}

export interface PostInfoUpdate {
  title?: string;
  about?: string;
  images?: string[];
  hashtags?: string[];
  timeToTake?: number;
  servings?: number;
  ingredients?: Ingredient[];
  instructions?: InstructionInfoUpdate[];
  difficulty?: string;
  course?: string[];
  dietary?: string[];
  hasProduct?: boolean;
  product?: {
    price?: number;
    quantity?: number;
    timeToPrepare?: number;
  }
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

export interface createPostInfo extends Omit<PostInfo, 'saved' | '_id' | 'author' | 'createdAt' | 'updatedAt' | 'instructions'> {
  instructions: {
    description: string;
    image?: string;
  }[];
  hasProduct: boolean;
}

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface IngredientOfList {
  _id: string;
  name: string;
  quantity: string;
  checked: boolean;
}

export interface ingredientOfListSchema {
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
export interface PostShoppingList {
  postId: string;
  title: string;
  imageUrl: string;
  servings: string;
  ingredients: IngredientOfList[];
}

export interface ShoppingListData {
  userId: string;
  posts: PostShoppingList[];
  standaloneIngredients: IngredientOfList[];
}

export interface updateIngredientInShoppingList {
  _id: string;
  name: string;
  quantity: string;
  checked: boolean;
}

export interface MealPlannedDate {
  date: string;
  mealTime?: boolean;
}

export interface Meal {
  _id: string;
  timeToTake?: string;
  title: string;
  imageUrl: string;
  is_planned: boolean;
  plannedDate?: MealPlannedDate[];
  postId: string;
}

export interface createMealData {
  postId: string;
  is_planned: boolean;
  plannedDate?: MealPlannedDate;
}

export interface MealPlanner {
  userId: string;
  meals: Meal[];
  createdAt: Date;
}

export interface DeleteMeal {
  mealId?: string;
  postId?: string;
}

export interface searchPostData {
  messsage: string;
  posts: PostInfo[],
  totalPosts: number,
  currentPage: number,
  pageSize: number,
  totalPages: number,
}

export interface PostProfile {
  posts: PostInfo[];
  authors: AccountInfo;
}

export interface ProductData {
  quantity: number;
  price: number;
  timeToPrepare: number;
}

export interface ProductInfo {
  _id: string;
  postId: string;
  quantity: number;
  price: number;
  timeToPrepare: number;
  postInfo: PostInfo;
}

export interface ProductCart {
  _id: string;
  productId: string;
  quantity: number;
  productInfo: ProductInfo;
  postInfo: PostInfo;
  author: AccountInfo;
}

export interface Cart {
  _id: string;
  userId: string;
  products: ProductCart[];
}

export interface PostFetcher {
  // product
  getAllProducts: (token: string) => Promise<PostResponse<ProductInfo[]>>;
  getCart: (token: string) => Promise<PostResponse<Cart>>;
  getProductByPostId: (postId: string, token: string) => Promise<PostResponse<ProductInfo>>;
  addProductToCart: (productId: string, quantity: number, token: string) => Promise<PostResponse<ProductInfo[]>>;
  removeProductFromCart: (productId: string, token: string) => Promise<PostResponse<ProductInfo[]>>;
  // posts
  getPostByUserFollowing: (page: number, limit: number, token: string) => Promise<PostResponse<PostInfo[]>>;
  getPostOfUser: (userId: string, page: number, limit: number, token: string) => Promise<PostResponse<PostInfo[]>>;
  createPost: (data: createPostInfo, productData: ProductData, token: string) => Promise<PostResponse<createPostInfo>>;
  getAllPosts: (token: string, page: number, limit: number, userId?: string) => Promise<PostResponse<PostInfo[]>>;
  updatePost: (postId: string, data: PostInfoUpdate, token: string) => Promise<PostResponse<PostInfo>>;
  getPostById: (postId: string, token: string) => Promise<PostResponse<PostInfo>>;
  deletePost: (postId: string, token: string) => Promise<PostResponse<PostInfo>>;
  likeOrUnlikePost: (postId: string, token: string) => Promise<PostResponse<PostLikeResponse>>;
  postLikesByUser: (token: string, userId?: string, page?: number, limit?: number) => Promise<PostResponse<PostLikesByUser>>;
  postSavedOrUnsaved: (postId: string, token: string) => Promise<PostResponse<PostLikeResponse>>;
  postSavedByUser: (token: string) => Promise<PostResponse<PostLikesByUser>>;
  isLikedPostByUser: (postId: string, token: string) => Promise<PostResponse<PostLikeResponse>>;
  isSavedPostByUser: (postId: string, token: string) => Promise<PostResponse<PostLikeResponse>>;
  searchPost: (query: string, minTime: string, maxTime: string,
    minQuality: string, haveMade: string, difficulty: string[], hashtags: string[],
    page: number, pageSize: number, token: string) => Promise<PostResponse<searchPostData>>;
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

  //shoppingList
  addIngredientToShoppingList: (token: string, postId?: string, servings?: number, ingredients?: Ingredient[]) => Promise<PostResponse<ShoppingListData>>
  getShoppingList: (token: string) => Promise<PostResponse<ShoppingListData>>
  checkPostInShoppingList: (postId: string, token: string) => Promise<PostResponse<PostLikeResponse>>
  removePostFromShoppingList: (postId: string, token: string) => Promise<PostResponse<PostLikeResponse>>
  updateIngredientInShoppingList: (token: string, ingredient: updateIngredientInShoppingList, postId?: string) => Promise<PostResponse<ShoppingListData>>
  removeIngredientFromShoppingList: (token: string, ingredientId: string, postId?: string) => Promise<PostResponse<ShoppingListData>>
  removeIngredientsFromShoppingList: (token: string, ingredientIds: string[], postIds?: string[]) => Promise<PostResponse<ShoppingListData>>

  //mealPlanner
  addMeal: (createMealData: createMealData, token: string) => Promise<PostResponse<Meal>>;
  getMealPlanner: (token: string) => Promise<PostResponse<MealPlanner>>;
  checkPostInUnscheduledMeal: (postId: string, token: string) => Promise<PostResponse<boolean>>;
  removeMeal: (deleteMeal: DeleteMeal, token: string) => Promise<PostResponse<Meal>>;
  scheduleMeal: (token: string, mealId: string, dates: MealPlannedDate[]) => Promise<PostResponse<Meal>>;
}

export const postFetcher: PostFetcher = {
  getPostByUserFollowing: async (page: number = 1, limit: number = 20, token: string): Promise<PostResponse<PostInfo[]>> => {
    return postInstance.get(postEndpoints.getPostByUserFollowing,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          page,
          limit,
        }
      }
    );
  },
  getPostOfUser: async (userId: string, page: number = 1, limit: number = 20, token: string): Promise<PostResponse<PostInfo[]>> => {
    return postInstance.get(postEndpoints.getPostOfUser.replace(":userId", userId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          page,
          limit,
        }
      }
    );
  },
  createPost: async (data: createPostInfo, productData: ProductData, token: string): Promise<PostResponse<createPostInfo>> => {
    return postInstance.post(postEndpoints.createPost, {
      post: data,
      product: productData,
    },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
  },
  getAllPosts: async (token: string, page: number = 1, limit: number = 20, userId?: string): Promise<PostResponse<PostInfo[]>> => {
    try {
      return postInstance.get(postEndpoints.getAllPosts, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          page,
          limit,
          userId,
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
  postLikesByUser: async (token: string, userId?: string, page?: number, limit?: number): Promise<PostResponse<PostLikesByUser>> => {
    return postInstance.get(postEndpoints.getPostLikesByUser,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          userId,
          page,
          limit,
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
  searchPost: async (query: string, maxTime: string, minTime: string,
    minQuality: string, haveMade: string, difficulty: string[],
    hashtags: string[],
    page: number, pageSize: number, token: string): Promise<PostResponse<searchPostData>> => {
    return postInstance.get(postEndpoints.searchPost,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          query,
          minTime,
          maxTime,
          minQuality,
          difficulty,
          haveMade,
          hashtags,
          page,
          pageSize,
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
  addIngredientToShoppingList: async (token: string, postId?: string, servings?: number, ingredients?: Ingredient[]): Promise<PostResponse<ShoppingListData>> => {
    return postInstance.post(postEndpoints.addIngredientToShoppingList, { postId, servings, ingredients },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  getShoppingList: async (token: string): Promise<PostResponse<ShoppingListData>> => {
    return postInstance.get(postEndpoints.getShoppingList,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  checkPostInShoppingList: async (postId: string, token: string): Promise<PostResponse<PostLikeResponse>> => {
    return postInstance.get(postEndpoints.checkIsPostInShoppingList.replace(":postId", postId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  removePostFromShoppingList: async (postId: string, token: string): Promise<PostResponse<PostLikeResponse>> => {
    return postInstance.patch(postEndpoints.removePostFromShoppingList.replace(":postId", postId), {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  updateIngredientInShoppingList: async (token: string, ingredient: updateIngredientInShoppingList, postId?: string): Promise<PostResponse<ShoppingListData>> => {
    return postInstance.patch(postEndpoints.updateIngredientInShoppingList, {
      ingredient,
      postId,
    },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  removeIngredientFromShoppingList: async (token: string, ingredientId: string, postId?: string): Promise<PostResponse<ShoppingListData>> => {
    return postInstance.patch(postEndpoints.removeIngredientFromShoppingList, {
      ingredientId,
      postId,
    },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  removeIngredientsFromShoppingList: async (token: string, ingredientIds: string[], postIds?: string[]): Promise<PostResponse<ShoppingListData>> => {
    return postInstance.patch(postEndpoints.removeIngredientsFromShoppingList, {
      ingredientIds,
      postIds,
    },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  addMeal: async (createMealData: createMealData, token: string): Promise<PostResponse<Meal>> => {
    return postInstance.post(postEndpoints.addMeal, createMealData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  getMealPlanner: async (token: string): Promise<PostResponse<MealPlanner>> => {
    return postInstance.get(postEndpoints.getMealPlanner,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  checkPostInUnscheduledMeal: async (postId: string, token: string): Promise<PostResponse<boolean>> => {
    return postInstance.get(postEndpoints.checkPostInUnscheduledMeal.replace(":postId", postId),
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  removeMeal: async (deleteMeal: DeleteMeal, token: string): Promise<PostResponse<Meal>> => {
    return postInstance.delete(postEndpoints.removeMeal, {
      data: deleteMeal,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  scheduleMeal: async (token: string, mealId: string, dates: MealPlannedDate[]): Promise<PostResponse<Meal>> => {
    return postInstance.patch(postEndpoints.scheduleMeal, {
      mealId,
      plannedDate: dates,
    },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
  },
  getAllProducts: async (token: string): Promise<PostResponse<ProductInfo[]>> => {
    return postInstance.get(postEndpoints.getAllProducts, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  getCart: async (token: string): Promise<PostResponse<Cart>> => {
    return postInstance.get(postEndpoints.getCart, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  getProductByPostId: async (postId: string, token: string): Promise<PostResponse<ProductInfo>> => {
    return postInstance.get(postEndpoints.getProductByPostId.replace(":postId", postId), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  addProductToCart: async (productId: string, quantity: number, token: string): Promise<PostResponse<ProductInfo[]>> => {
    return postInstance.patch(postEndpoints.addProductToCart, {
      productId,
      quantity,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  removeProductFromCart: async (productId: string, token: string): Promise<PostResponse<ProductInfo[]>> => {
    return postInstance.patch(postEndpoints.removeProductFromCart.replace(":productId", productId), {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
}
