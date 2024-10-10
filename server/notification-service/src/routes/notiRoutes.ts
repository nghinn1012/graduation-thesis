import express from "express";
import { createChatGroupController, getChatGroupsController, getMessagesController, sendMessageController } from "../controllers/messageController";
import { getAllNotificationsController, hello } from "../controllers/notiController";
import { tokenValidate } from "../middlewares";

const notiRouter = express.Router();
notiRouter.get("/hello", hello)
notiRouter.get("/getAllNotifications", tokenValidate, getAllNotificationsController);
notiRouter.post("/sendMessage", tokenValidate, sendMessageController);
notiRouter.get("/getChatGroups", tokenValidate, getChatGroupsController);
notiRouter.get("/getMessages/:chatGroupId", tokenValidate, getMessagesController);
notiRouter.post("/createChatGroup", tokenValidate, createChatGroupController);
export default notiRouter;
