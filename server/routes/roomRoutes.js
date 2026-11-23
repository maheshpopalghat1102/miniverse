
import express from "express";

import {
  createRoom,
  getRoomByCode,
  joinRoom,
  leaveRoom,
  setReadyStatus,
  closeRoom
} from "../controllers/roomController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All room operations require authentication.
router.use(authMiddleware);

// Create room
router.post("/", createRoom);

// Get room information
router.get("/code/:roomCode", getRoomByCode);

// Join room
router.post("/code/:roomCode/join", joinRoom);

// Leave room
router.post("/code/:roomCode/leave", leaveRoom);

// Set ready status
router.patch("/code/:roomCode/ready", setReadyStatus);

// Close room (host authorization checked in controller)
router.patch("/code/:roomCode/close", closeRoom);

export default router;
