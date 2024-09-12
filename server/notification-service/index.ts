import express, { Request, Response } from "express";
import cors from 'cors';
import { NOTIFICATION_PORT } from "./src/config/notification.config";
import notiRouter from "./src/routes/notiRoutes";
import { RabbitMQ, initBrokerConsumners, initRpcConsumers } from "./src/broker/index";

const app = express();

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
