
import express from "express";

import {
  getPrompts,
  getRandomPrompt,
  resetQuestionHistory,
  createPrompt,
  updatePrompt,
  deletePrompt,
} from "../controllers/truthDareController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// All Truth or Dare routes require authentication.
router.use(authMiddleware);

// Get a batch of prompts that the user has not seen.
router.get("/prompts", getPrompts);

// Get one random unused prompt and record it in history.
router.get("/random", getRandomPrompt);

// Explicitly reset the authenticated user's Truth or Dare history.
router.delete("/history", resetQuestionHistory);

// Admin-only prompt management.
router.post(
  "/prompts",
  adminMiddleware,
  createPrompt
);

router.patch(
  "/prompts/:id",
  adminMiddleware,
  updatePrompt
);

router.delete(
  "/prompts/:id",
  adminMiddleware,
  deletePrompt
);

export default router;
