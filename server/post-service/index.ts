import express from "express";
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB, connectCloudinary } from "./src/db/index.db";
import { POST_PORT } from "./src/config/post.config";
import postRouter from "./src/routes/postRoutes";
import http from 'http';
import { setupSocketIO } from "./src/socket";
import axios from "axios";
import crypto from "crypto";

const app = express();
const server = http.createServer(app);
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

connectDB();
connectCloudinary();

setupSocketIO(io);

app.use("/posts", postRouter);


server.listen(POST_PORT, () => {
  console.log(`Post-Service running on port ${POST_PORT}`);
});
