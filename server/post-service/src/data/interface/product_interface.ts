import { IAuthor } from '../../services/rpc.services';
import { IPost, IProduct } from './post_create_interface';

export interface ReviewCreate {
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
