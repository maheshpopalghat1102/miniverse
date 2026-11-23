
import express from "express";

import {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus
} from "../controllers/reportController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Submit a report
router.post("/", createReport);

// View own reports
router.get("/me", getMyReports);

// Admin-only moderation
router.get("/", adminMiddleware, getAllReports);

router.patch(
  "/:reportId",
  adminMiddleware,
  updateReportStatus
);

export default router;
