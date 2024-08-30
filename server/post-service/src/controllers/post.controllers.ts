import { Request, Response } from "express";
import { postFood } from "../services/post.services";

export const hello = (_request: Request, response: Response): Response => {
  return response.send("Hello from Post Service");
}

export const createPost = async (request: Request, response: Response) => {
  const post = await postFood(request.body);
  if (post == null) {
    return response.status(400).send("Cannot create post");
  }
  return response.send(post);
}
