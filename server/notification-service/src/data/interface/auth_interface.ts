import { Request } from 'express';

export interface IAuthContent {
  data: {
    userId: string;
    email: string;
  }
}

export interface AuthRequest extends Request {
  authContent?: IAuthContent;
}
