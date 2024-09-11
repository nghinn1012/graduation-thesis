import express from "express";
import { createPostController, getAllPostsController, getPostController, updatePostController } from "../controllers/post.controllers";
import { tokenValidate, errorHandler } from "../middlewares/index";
import { attachSocketIo } from "../middlewares/attachSocketIo";

const postRouter = express.Router();
postRouter.post("/create", tokenValidate, createPostController);
postRouter.get("/:id", tokenValidate, getPostController);
postRouter.patch("/:id", tokenValidate, updatePostController);
postRouter.get("/", tokenValidate, getAllPostsController);
postRouter.use(errorHandler);
export default postRouter;
