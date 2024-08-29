import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { connectDB } from "./src/db";
import { NOTIFICATION_PORT, USER_SERVICE } from "./src/config/notification.config";
import notiRouter from "./src/routes/notiRoutes";
import { RabbitMQ, initBrokerConsumners, initRpcConsumers } from "./src/broker/index";
const nodemailer = require("nodemailer");

const app = express();

// connectDB();
const rabbit = RabbitMQ.instance;
initRpcConsumers(rabbit);
initBrokerConsumners(rabbit);

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(notiRouter);


app.listen(NOTIFICATION_PORT, () => {
  console.log(`Notification-Service running on port ${NOTIFICATION_PORT}`);
});
