
import express from "express";

import {
  createUploadSignature,
  deleteUploadedImage
} from "../controllers/uploadController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Generate signed Cloudinary upload credentials
router.post("/signature", createUploadSignature);

// Delete an owned uploaded image
router.delete("/", deleteUploadedImage);

export default router;
