
import express from "express";

import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Get notifications
router.get("/", getMyNotifications);

// Get unread notification count
router.get("/unread-count", getUnreadCount);

// Mark all notifications as read
router.patch("/read-all", markAllAsRead);

// Mark individual notification as read
router.patch("/:notificationId/read", markAsRead);

// Delete notification
router.delete("/:notificationId", deleteNotification);

export default router;
