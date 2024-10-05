import express from "express";
import { sendMessageController } from "../controllers/messageController";
import { hello } from "../controllers/notiController";
import { tokenValidate } from "../middlewares";

const notiRouter = express.Router();
notiRouter.get("/hello", hello)
notiRouter.post("/sendMessage", tokenValidate, sendMessageController);

export default notiRouter;
