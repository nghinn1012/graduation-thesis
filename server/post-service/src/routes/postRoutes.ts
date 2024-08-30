import express from "express";
import { createPost, hello } from "../controllers/post.controllers";

const notiRouter = express.Router();
notiRouter.get("/hello", hello);
notiRouter.post("/create", createPost);
export default notiRouter;
