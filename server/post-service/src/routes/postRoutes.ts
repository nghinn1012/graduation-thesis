import express from "express";
import { createPostController, getPostController, updatePostController } from "../controllers/post.controllers";
import { tokenValidate, errorHandler } from "../middlewares/index";

const postRouter = express.Router();
postRouter.post("/create", tokenValidate, createPostController);
postRouter.get("/:id", tokenValidate, getPostController);
postRouter.patch("/:id", tokenValidate, updatePostController);
postRouter.use(errorHandler);
export default postRouter;
