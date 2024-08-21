import express, { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { connectDB } from "./src/db/users.db";
import userRouter from "./src/routes/users.routes";

dotenv.config();

const app = express();
const PORT = process.env.USER_PORT;

connectDB();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use("/users", userRouter);


app.listen(PORT, () => {
  console.log(`Auth-Service running on port ${PORT}`);
});
