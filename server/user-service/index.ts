import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/db/users.db";
import userRouter from "./src/routes/users.routes";
import cors from "cors";
import { RabbitMQ, initBrokerConsumners, initRpcConsumers } from "./src/broker";
import { connectCloudinary } from "./src/db/cloudinary.db";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
const PORT = process.env.USER_PORT;
const rabbit = RabbitMQ.instance;
initRpcConsumers(rabbit);
initBrokerConsumners(rabbit);
connectDB();
(async () => {
  await connectCloudinary();
})();

app.use("/users", userRouter);

app.listen(PORT, () => {
  console.log(`Auth-Service running on port ${PORT}`);
});
