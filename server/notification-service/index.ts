import express, { Request, Response } from "express";
import cors from 'cors';
import { NOTIFICATION_PORT } from "./src/config/notification.config";
import notiRouter from "./src/routes/notiRoutes";
import { RabbitMQ, initBrokerConsumners, initRpcConsumers } from "./src/broker/index";
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import { setupSocketIO } from "./src/socket";
import { connectDB } from "./src/db";
const app = express();
const server = http.createServer(app);
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});
const rabbit = RabbitMQ.instance;
initRpcConsumers(rabbit);
initBrokerConsumners(rabbit);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use("/notifications", notiRouter);

connectDB();

setupSocketIO(io);
// connectCloudinary();

server.listen(NOTIFICATION_PORT, () => {
  console.log(`Notification-Service running on port ${NOTIFICATION_PORT}`);
});
