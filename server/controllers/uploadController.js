
import crypto from "node:crypto";

import { cloudinary } from "../config/cloudinary.js";
import { getCloudinary } from "../config/cloudinary.js";

const getUserId = (req) => req.user?.id || req.user?._id;

const getFolder = (type) => {
  const folders = {
    avatar: "miniverse/avatars",
    cover: "miniverse/covers",
    game: "miniverse/games",
    picture: "miniverse/pictures"
  };

  return folders[type] || null;
};

export const createUploadSignature = async (req, res, next) => {
  try {
    const { type = "avatar" } = req.body;

    const folder = getFolder(type);

    if (!folder) {
      return res.status(400).json({
        success: false,
        message: "Invalid upload type."
      });
    }

    const client = getCloudinary();

    const timestamp = Math.floor(Date.now() / 1000);

    const publicId =
      `${getUserId(req)}_${crypto.randomBytes(12).toString("hex")}`;

    const parameters = {
      folder,
      public_id: publicId,
      timestamp,
      transformation: "c_limit,w_1600,h_1600,q_auto,f_auto"
    };

    const signature = client.utils.api_sign_request(
      parameters,
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      success: true,
      upload: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        timestamp,
        signature,
        folder,
        publicId,
        transformation: parameters.transformation
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUploadedImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;

    if (!publicId || typeof publicId !== "string") {
      return res.status(400).json({
        success: false,
        message: "A valid public ID is required."
      });
    }

    const allowedPrefixes = ["avatars", "covers", "games", "pictures"]
      .map((folder) => `miniverse/${folder}/${getUserId(req)}_`);

    if (!allowedPrefixes.some((prefix) => publicId.startsWith(prefix))) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this image."
      });
    }

    const client = getCloudinary();

    const result = await client.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true
    });

    if (result.result !== "ok" && result.result !== "not found") {
      return res.status(400).json({
        success: false,
        message: "Image deletion failed."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image deletion processed.",
      result: result.result
    });
  } catch (error) {
    next(error);
  }
};
