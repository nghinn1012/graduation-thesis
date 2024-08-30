import { Request, Response } from "express";
import { createPostService } from "../services/post.services";
import { AuthRequest } from "../data/interface/auth_interface";

export const hello = (_request: Request, response: Response): Response => {
  return response.send("Hello from Post Service");
}

export const createPostController = async (request: AuthRequest, response: Response) => {
  try {
    console.log(request.authContent);
    const post = await createPostService({
      ...request.body,
      author: request.authContent?.data.userId
    });
    if (post == null) {
      return response.status(400).json({
        message: "Cannot create post"
      });
    }
    return response.status(200).json(post);
  } catch (error) {
    return response.status(400).json({
      message: "Cannot create post error co chay qua k",
      error
    });
  }
}
