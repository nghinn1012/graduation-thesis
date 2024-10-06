import mongoose from "mongoose";
import {
  MONGO_LOCAL_URI,
  CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME
} from "../config/notification.config"
import { v2 as cloudinary } from "cloudinary";

export const connectDB = async () => {
  mongoose.connect(MONGO_LOCAL_URI);

  const conn = mongoose.connection;

  conn.on("connected", function () {
    console.log("[MONGODB] ", "database is connected successfully");
  });

  conn.on("error", console.error.bind(console, "connection error:"));
};

export const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });

  console.log("Cloudinary connected successfully");
}
