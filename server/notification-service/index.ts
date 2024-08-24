import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { connectDB } from "./src/db";
import { NOTIFICATION_PORT } from "./src/config/notification.config";
import notiRouter from "./src/routes/notiRoutes";
import { publishMessage, subscribeMessage } from "./src/broker/broker";
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());

connectDB();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(notiRouter);


app.listen(NOTIFICATION_PORT, () => {
  console.log(`Notification-Service running on port ${NOTIFICATION_PORT}`);
});

subscribeMessage().then(() => {
  publishMessage("User service", "Hello from Message service");
});
