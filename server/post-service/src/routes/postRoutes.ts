import express from "express";
import { createPostController, getPostController, hello, updatePostController } from "../controllers/post.controllers";
import { tokenValidate } from "../middlewares/authenticate_token";
import { errorHandler } from "../middlewares/error_handler";

const postRouter = express.Router();
postRouter.get("/hello", hello);
postRouter.post("/create", tokenValidate, createPostController);
postRouter.get("/:id", tokenValidate, getPostController);
postRouter.patch("/:id", tokenValidate, updatePostController);
postRouter.use(errorHandler);
export default postRouter;
