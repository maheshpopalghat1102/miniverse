
import express from "express";

import {
  sendFriendRequest,
  getFriendRequests,
  getSentFriendRequests,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getMyFriends,
  removeFriend,
  blockUser
} from "../controllers/friendController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Friend list
router.get("/", getMyFriends);

// Incoming requests
router.get("/requests", getFriendRequests);
router.get("/requests/sent", getSentFriendRequests);
router.delete("/requests/:requestId", cancelFriendRequest);

// Send request
router.post("/:userId/request", sendFriendRequest);

// Accept request
router.patch("/requests/:requestId/accept", acceptFriendRequest);

// Reject request
router.patch("/requests/:requestId/reject", rejectFriendRequest);

// Remove friend
router.delete("/:userId", removeFriend);

// Block user
router.post("/:userId/block", blockUser);

export default router;
