import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from "./src/db";
import { NOTIFICATION_PORT } from "./src/config/post.config";
import postRouter from "./src/routes/postRoutes";
import { connectCloudinary } from "./src/db/cloudinary.db";
import http from 'http';
import { setupSocketIO } from "./src/socket";
const app = express();
const server = http.createServer(app);
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Thay đổi kích thước theo nhu cầu
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Thay đổi kích thước theo nhu cầu

// Database connections
connectDB();
connectCloudinary();

setupSocketIO(io);

app.use("/posts", postRouter);

// Start the server
server.listen(NOTIFICATION_PORT, () => {
  console.log(`Post-Service running on port ${NOTIFICATION_PORT}`);
});
