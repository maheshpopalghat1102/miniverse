
import express from "express";

import {
  createMatch,
  getMatchById,
  completeMatch,
  cancelMatch
} from "../controllers/matchController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Start a match
router.post("/", createMatch);

// Get match details
router.get("/:matchId", getMatchById);

// Complete a match
router.post("/:matchId/complete", completeMatch);

// Cancel a match
router.post("/:matchId/cancel", cancelMatch);

export default router;
