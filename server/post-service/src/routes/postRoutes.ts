import express from "express";
import { hello } from "../controllers/post.controllers";

const notiRouter = express.Router();
notiRouter.get("/hello", hello)

export default notiRouter;
