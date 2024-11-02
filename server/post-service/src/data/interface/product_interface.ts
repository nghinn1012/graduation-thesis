import { IAuthor } from '../../services/rpc.services';
import { IPost, IProduct } from './post_create_interface';

export interface ReviewCreate {
  productId: string;
  rating: number;
  review: string;
}

export interface Review {
  author?: IAuthor;
  userId: string;
  rating: number;
  review: string;
}

export interface Product {
  _id: string;
  postInfo: IPost;
  averageRating: number;
  productInfo: IProduct;
  author: IAuthor;
  reviews: Review[];
}

export interface Order {
  _id: string;
  userId: string;
  products: Product[];
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderCreate {
  userId: string;
  sellerId: string;
  info: {
    name: string;
    phone: string;
  };
  address: string;
  note: string;
  paymentMethod: string;
  amount: number;
  products: {
    productId: string;
    quantity: number;
  }[];
  status?: string;
}
