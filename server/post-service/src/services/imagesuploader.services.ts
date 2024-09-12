import { v2 as cloudinary } from "cloudinary";

export const uploadImageToCloudinary = async (image: string) => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
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
      console.error(`Failed to upload image to Cloudinary (Attempt ${attempt}):`, error);

      if (attempt >= maxRetries) {
        console.error("Max retries reached. Image upload failed.");
        throw new Error("Image upload failed after 3 attempts");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
