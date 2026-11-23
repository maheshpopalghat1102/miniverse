
import { v2 as cloudinary } from "cloudinary";

let initialized = false;

export function initializeCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const hasAnySetting = Boolean(
    cloudName || apiKey || apiSecret
  );

  if (!hasAnySetting) {
    console.warn(
      "Cloudinary is not configured. Upload features are unavailable."
    );

    initialized = false;
    return null;
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must all be configured."
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });

  initialized = true;

  console.log("Cloudinary initialized successfully.");

  return cloudinary;
}

export function getCloudinary() {
  if (!initialized) {
    throw new Error(
      "Cloudinary is not initialized. Configure Cloudinary credentials first."
    );
  }

  return cloudinary;
}

export { cloudinary };
