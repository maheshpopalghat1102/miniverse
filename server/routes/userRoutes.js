
import express from "express";

import {
  getMyProfile,
  getUserById,
  getUserByUsername,
  updateMyProfile,
  searchUsers,
  updateAccountSettings,
  deleteMyAccount,
  getMyGameHistory
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All user routes require authentication.
router.use(authMiddleware);

// Current user's profile
router.get("/me/profile", getMyProfile);
router.patch("/me/profile", updateMyProfile);

// Search users
router.get("/search", searchUsers);
router.get("/username/:username", getUserByUsername);

// Account settings
router.patch("/me/settings", updateAccountSettings);

// Game history
router.get("/me/history", getMyGameHistory);

// Account deactivation
router.delete("/me", deleteMyAccount);

// Public/friends/private profile visibility is enforced
// inside the controller.
router.get("/:userId", getUserById);

export default router;
