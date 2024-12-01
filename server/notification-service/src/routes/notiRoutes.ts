import express from "express";
import { createChatGroupController, getChatGroupsController, getMessagesController, markAllMessagesReadInGroupController, markMessageReadController, renameChatGroupController, sendMessageController, updateChatGroupAvatarController } from "../controllers/messageController";
import { getAllNotificationsController, hello, markAllNotificationsAsReadController, markNotificationAsReadController } from "../controllers/notiController";
import { tokenValidate } from "../middlewares";

const notiRouter = express.Router();
notiRouter.get("/hello", hello)
notiRouter.get("/getAllNotifications", tokenValidate, getAllNotificationsController);
notiRouter.post("/sendMessage", tokenValidate, sendMessageController);
notiRouter.get("/getChatGroups", tokenValidate, getChatGroupsController);
notiRouter.get("/getMessages/:chatGroupId", tokenValidate, getMessagesController);
notiRouter.post("/createChatGroup", tokenValidate, createChatGroupController);
notiRouter.patch("/updateChatGroupName", tokenValidate, renameChatGroupController);
notiRouter.patch("/updateChatGroupAvatar", tokenValidate, updateChatGroupAvatarController);
notiRouter.patch("/markNotificationAsRead/:notificationId", tokenValidate, markNotificationAsReadController);
notiRouter.patch("/markAllNotificationsAsRead", tokenValidate, markAllNotificationsAsReadController);
notiRouter.post("/markMessageAsRead", tokenValidate, markMessageReadController);
notiRouter.post("/markAllMessagesAsRead", tokenValidate, markAllMessagesReadInGroupController);
export default notiRouter;
