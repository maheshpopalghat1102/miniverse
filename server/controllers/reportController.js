
import Report from "../models/Report.js";
import User from "../models/User.js";

const getUserId = (req) => req.user?.id || req.user?._id;

export const createReport = async (req, res, next) => {
  try {
    const {
      reportedUser,
      reportedRoom,
      reportedMatch,
      category,
      description,
      evidence = []
    } = req.body;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: "Category and description are required."
      });
    }

    if (
      !["harassment", "abuse", "cheating", "inappropriate_content", "spam", "fake_account", "other"].includes(category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid report category."
      });
    }

    if (
      typeof description !== "string" ||
      description.trim().length < 5 ||
      description.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must contain between 5 and 2000 characters."
      });
    }

    if (!Array.isArray(evidence) || evidence.length > 5) {
      return res.status(400).json({
        success: false,
        message: "A maximum of 5 evidence references is allowed."
      });
    }

    if (!reportedUser && !reportedRoom && !reportedMatch) {
      return res.status(400).json({
        success: false,
        message: "You must identify the user, room or match being reported."
      });
    }

    if (reportedUser) {
      const userExists = await User.exists({
        _id: reportedUser
      });

      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "Reported user not found."
        });
      }
    }

    const report = await Report.create({
      reporter: getUserId(req),
      reportedUser: reportedUser || null,
      reportedRoom: reportedRoom || null,
      reportedMatch: reportedMatch || null,
      category,
      description: description.trim(),
      evidence
    });

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully.",
      report
    });
  } catch (error) {
    next(error);
  }
};

export const getMyReports = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 10));

    const reports = await Report.find({
      reporter: getUserId(req)
    })
      .select("-evidence")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      page,
      limit,
      reports
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN / MODERATOR ONLY
export const getAllReports = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const reports = await Report.find(filter)
      .populate("reporter", "username")
      .populate("reportedUser", "username")
      .populate("assignedTo", "username")
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      page,
      limit,
      reports
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN / MODERATOR ONLY
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, priority, resolution } = req.body;

    const allowedStatuses = [
      "pending",
      "reviewing",
      "resolved",
      "dismissed"
    ];

    const allowedPriorities = [
      "low",
      "normal",
      "high",
      "urgent"
    ];

    const updates = {};

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid report status."
        });
      }

      updates.status = status;

      if (["resolved", "dismissed"].includes(status)) {
        updates.resolvedAt = new Date();
      }
    }

    if (priority !== undefined) {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority."
        });
      }

      updates.priority = priority;
    }

    if (resolution !== undefined) {
      if (typeof resolution !== "string" || resolution.length > 2000) {
        return res.status(400).json({
          success: false,
          message: "Invalid resolution."
        });
      }

      updates.resolution = resolution;
    }

    updates.assignedTo = getUserId(req);

    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report updated.",
      report
    });
  } catch (error) {
    next(error);
  }
};
