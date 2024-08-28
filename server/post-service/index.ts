import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { connectDB } from "./src/db";
import { NOTIFICATION_PORT, USER_SERVICE } from "./src/config/post.config";
import notiRouter from "./src/routes/postRoutes";
import { publishMessage, subscribeMessage } from "./src/broker/broker";
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());

// connectDB();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(notiRouter);

app.listen(NOTIFICATION_PORT, () => {
  console.log(`Notification-Service running on port ${NOTIFICATION_PORT}`);
});

subscribeMessage().then(() => {
  publishMessage(USER_SERVICE, "Test gui tu notifi service");
});