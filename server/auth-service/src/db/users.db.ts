import mongoose from "mongoose";
import {
  MONGO_LOCAL_URI
} from "../config/users.config"

export const connectDB = async () => {
  mongoose.connect(MONGO_LOCAL_URI);

  const conn = mongoose.connection;

  conn.on("connected", function () {
    console.log("Database is connected successfully");
  });

  conn.on("error", console.error.bind(console, "connection error:"));
};
