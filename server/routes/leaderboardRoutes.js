
import express from "express";

import {
  getGlobalLeaderboard,
  getGameLeaderboard
} from "../controllers/leaderboardController.js";

const router = express.Router();

// Global leaderboard
router.get("/", getGlobalLeaderboard);

// Specific game leaderboard
router.get("/game/:gameId", getGameLeaderboard);

export default router;
