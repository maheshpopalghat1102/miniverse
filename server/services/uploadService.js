import { getCloudinary } from "../config/cloudinary.js";

const ALLOWED_FOLDERS = ["miniverse/avatars", "miniverse/covers"];

export const createSignedUpload = ({
  userId,
  folder = "miniverse/avatars",
}) => {
  if (!ALLOWED_FOLDERS.includes(folder)) {
    throw new Error("Invalid upload folder.");
  }

  const cloudinary = getCloudinary();
  const timestamp = Math.floor(Date.now() / 1000);

  const params = {
    timestamp,
    folder,
    public_id: `${userId}_${timestamp}`,
  };

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    ...params,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
};

export const deleteCloudinaryImage = async ({
  publicId,
  userId,
  resourceType = "image",
}) => {
  if (!publicId || !userId) {
    throw new Error("Image public ID and user ID are required.");
  }

  const allowedPrefix = `miniverse/avatars/${userId}_`;

  if (!publicId.startsWith(allowedPrefix)) {
    throw new Error("You are not authorized to delete this image.");
  }

  const cloudinary = getCloudinary();

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
};