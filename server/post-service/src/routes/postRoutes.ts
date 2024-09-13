import express from "express";
import { createPostController, deletePostController, getAllPostsController, getPostController, updatePostController } from "../controllers/post.controllers";
import { tokenValidate, errorHandler } from "../middlewares/index";
import { getPostLikesByUserController, getSavedPostsByUserController, likeOrUnlikePostController, saveOrUnsavedPostController } from "../controllers/postAction.controller";

const postRouter = express.Router();
postRouter.post("/:id/like", tokenValidate, likeOrUnlikePostController);
postRouter.get("/likes", tokenValidate, getPostLikesByUserController);
postRouter.post("/:id/save", tokenValidate, saveOrUnsavedPostController);
postRouter.get("/savedList", tokenValidate, getSavedPostsByUserController);
postRouter.post("/create", tokenValidate, createPostController);
postRouter.get("/:id", tokenValidate, getPostController);
postRouter.patch("/:id", tokenValidate, updatePostController);
postRouter.get("/", tokenValidate, getAllPostsController);
postRouter.delete("/:id", tokenValidate, deletePostController);

postRouter.use(errorHandler);
export default postRouter;
