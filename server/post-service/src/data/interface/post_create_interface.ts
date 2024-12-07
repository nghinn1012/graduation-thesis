export interface IIngredient {
  name: string;
  quantity: string;
}

export interface IInstruction {
  step: number;
  description: string;
  image?: string;
}

export interface IPost {
  _id: string;
  author: string;
  images: string[];
  title: string;
  about: string;
  hashtags: string[];
  timeToTake: number;
  servings: number;
  ingredients: IIngredient[];
  instructions: IInstruction[];
  createdAt: Date;
  updatedAt: Date;
  hasProduct: boolean;
  product?: IProduct;
}

export interface IProduct {
  postId: string;
  price: number;
  quantity: number;
  timeToPrepare: number;
}

export interface IPostNotification {
  _id: string;
  title: string;
  image: string;
  accepted?: boolean;
}

export interface AccountInfo {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  username: string;
  followers: string[];
  role: string;
}


export interface OrderStats {
  total: number;
  successful: number;
  percentage: number;
}

export interface OrderAnalytics {
  daily: OrderStats;
  weekly: OrderStats;
  monthly: OrderStats;
}

export interface DashboardStats {
  orderAnalytics: OrderAnalytics;
  totalStats: {
    totalPosts: number;
    totalProducts: number;
    totalOrders: number;
  };
}
