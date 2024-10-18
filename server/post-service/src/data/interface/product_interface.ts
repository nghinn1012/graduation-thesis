import { IAuthor } from '../../services/rpc.services';
import { IPost, IProduct } from './post_create_interface';

export interface Product {
  _id: string;
  postInfo: IPost;
  productInfo: IProduct;
  author: IAuthor;
}
