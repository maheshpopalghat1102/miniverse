
import express from "express";

import {
  getMyScores,
  getGameScores
} from "../controllers/scoreController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Current user's score history
router.get("/me", getMyScores);

// Current user's scores for a particular game
router.get("/game/:gameId", getGameScores);

export default router;

