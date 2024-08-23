import express from "express";
import { hello } from "../controllers/notiController";

const notiRouter = express.Router();
notiRouter.get("/hello", hello)

export default notiRouter;
