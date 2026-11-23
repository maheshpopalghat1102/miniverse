
import express from "express";

import {
  getAllAchievements,
  getMyAchievements,
  getUnlockedAchievements,
  createAchievement,
  updateAchievement
} from "../controllers/achievementController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public achievement catalogue
router.get("/", getAllAchievements);

// Protected player achievements
router.get("/me", authMiddleware, getMyAchievements);
router.get("/me/unlocked", authMiddleware, getUnlockedAchievements);

// Admin management
router.post("/", authMiddleware, adminMiddleware, createAchievement);
router.patch("/:id", authMiddleware, adminMiddleware, updateAchievement);

export default router;
