import express from "express";
import { createPostController, hello } from "../controllers/post.controllers";
import { tokenValidate } from "../middlewares/authenticate_token";
import { errorHandler } from "../middlewares/error_handler";

const postRouter = express.Router();
postRouter.get("/hello", hello);
postRouter.post("/create", tokenValidate, createPostController);
postRouter.use(errorHandler);
export default postRouter;
