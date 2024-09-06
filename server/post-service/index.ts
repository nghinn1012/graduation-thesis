import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from 'cors';
import { connectDB } from "./src/db";
import { NOTIFICATION_PORT } from "./src/config/post.config";
import postRouter from "./src/routes/postRoutes";
import { connectCloudinary } from "./src/db/cloudinary.db";

const app = express();
app.use(cors());

connectDB();

connectCloudinary();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/posts", postRouter);

app.listen(NOTIFICATION_PORT, () => {
  console.log(`Post-Service running on port ${NOTIFICATION_PORT}`);
});
