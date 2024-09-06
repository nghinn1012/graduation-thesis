import { v2 as cloudinary } from "cloudinary";

export const uploadImageToCloudinary = async (image: string) => {
  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: "posts",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Failed to upload image to Cloudinary:", error);
    throw new Error("Image upload failed");
  }
};
