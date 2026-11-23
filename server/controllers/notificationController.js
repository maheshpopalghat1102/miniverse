
import Notification from "../models/Notification.js";

const getUserId = (req) => req.user?.id || req.user?._id;

export const getMyNotifications = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const notifications = await Notification.find({
      recipient: getUserId(req)
    })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      page,
      limit,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: getUserId(req),
      isRead: false
    });

    return res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.notificationId,
        recipient: getUserId(req)
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found."
      });
    }

    return res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: getUserId(req),
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      recipient: getUserId(req)
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted."
    });
  } catch (error) {
    next(error);
  }
};
