
import express from "express";

import {
  getAllGames,
  getGameById,
  getGameCategories,
  getFeaturedGames,
  createGame,
  updateGame
} from "../controllers/gameController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public game catalogue
router.get("/", getAllGames);
router.get("/categories", getGameCategories);
router.get("/featured", getFeaturedGames);

// Admin-only game management
router.post("/", adminMiddleware, createGame);
router.patch("/:id", adminMiddleware, updateGame);

// Game details
router.get("/:id", getGameById);

export default router;
