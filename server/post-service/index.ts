import express from "express";
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB, connectCloudinary } from "./src/db/index.db";
import { NOTIFICATION_PORT } from "./src/config/post.config";
import postRouter from "./src/routes/postRoutes";
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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

connectDB();
connectCloudinary();

setupSocketIO(io);

app.use("/posts", postRouter);

server.listen(NOTIFICATION_PORT, () => {
  console.log(`Post-Service running on port ${NOTIFICATION_PORT}`);
});
