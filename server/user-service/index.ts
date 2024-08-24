import express, { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "./src/db/users.db";
import userRouter from "./src/routes/users.routes";
import cors from 'cors';
import { subscribeMessage } from "./src/broker/broker";

dotenv.config();

const app = express();
app.use(cors());
const PORT = process.env.USER_PORT;

connectDB();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/users", userRouter);

app.listen(PORT, () => {
  console.log(`Auth-Service running on port ${PORT}`);
});

subscribeMessage().then(() => {
  console.log("[MESSAGE BROKER] start listening messages");
});
