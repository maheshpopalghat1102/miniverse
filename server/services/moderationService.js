import Report from "../models/Report.js";

export const createUserReport = async ({
  reporter,
  reportedUser = null,
  reportedRoom = null,
  reportedMatch = null,
  category,
  description,
  evidence = [],
}) => {
  if (!reportedUser && !reportedRoom && !reportedMatch) {
    throw new Error("A user, room, or match must be reported.");
  }

  if (!category || !description?.trim()) {
    throw new Error("Report category and description are required.");
  }

  return Report.create({
    reporter,
    reportedUser,
    reportedRoom,
    reportedMatch,
    category,
    description: description.trim(),
    evidence,
    status: "pending",
    priority: "normal",
  });
};

export const getUserReports = async (userId, page = 1, limit = 20) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);

  return Report.find({ reporter: userId })
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
};

export const getModerationQueue = async ({
  status = "pending",
  page = 1,
  limit = 20,
}) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);

  return Report.find(status ? { status } : {})
    .populate("reporter reportedUser assignedTo", "username avatar")
    .sort({ priority: -1, createdAt: 1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit);
};

export const updateReport = async ({
  reportId,
  moderatorId,
  status,
  resolution = "",
}) => {
  const allowedStatuses = [
    "pending",
    "under_review",
    "resolved",
    "rejected",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid report status.");
  }

  const report = await Report.findById(reportId);

  if (!report) throw new Error("Report not found.");

  report.status = status;
  report.assignedTo = moderatorId;
  report.resolution = resolution;

  if (["resolved", "rejected"].includes(status)) {
    report.resolvedAt = new Date();
  }

  await report.save();
  return report;
};