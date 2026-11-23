
import express from "express";

import {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getCurrentUser
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authLimiter } from "../config/security.js";

const router = express.Router();

// Public authentication routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refreshToken);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Logout uses the refresh-token cookie to revoke its session.
router.post("/logout", logout);

// Protected route
router.get("/me", authMiddleware, getCurrentUser);

export default router;
