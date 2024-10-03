import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../config/users.config";

export const connectCloudinary = async () => {
  console.log("CLOUDINARY_CLOUD_NAME:", CLOUDINARY_CLOUD_NAME);
  console.log("CLOUDINARY_API_KEY:", CLOUDINARY_API_KEY);
  console.log("CLOUDINARY_API_SECRET:", CLOUDINARY_API_SECRET);
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });

  console.log("Cloudinary connected successfully");
}
