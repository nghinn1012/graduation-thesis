import { v2 as cloudinary } from "cloudinary";

export const uploadImageToCloudinary = async (image: string) => {
  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: "posts",
      transformation: [
        { width: 800, height: 600, crop: "limit" },
        { quality: "auto" }
      ]
    });
    console.log("Image uploaded to Cloudinary:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Failed to upload image to Cloudinary:", error);
    throw new Error("Image upload failed");
  }
};
