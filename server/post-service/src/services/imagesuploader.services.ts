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

export const deleteImageFromCloudinary = async (publicId: string, retries: number = 3): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === 'ok') {
        console.log(`Successfully deleted image with public ID ${publicId}.`);
        return;
      } else {
        throw new Error(`Failed to delete image with public ID ${publicId}.`);
      }
    } catch (error) {
      console.error(`Attempt ${attempt} - Error deleting image with public ID ${publicId}:`, error);
      if (attempt === retries) {
        throw new Error(`Failed to delete image with public ID ${publicId} after ${retries} attempts.`);
      }
    }
  }
};

export const extractPublicIdFromUrl = (url: string): string => {
  const matches = url.match(/\/v\d+\/(.*)\./);
  return matches ? matches[1] : '';
};
