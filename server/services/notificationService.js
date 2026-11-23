import Notification from "../models/Notification.js";

export const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  data = {},
  actionUrl = null,
}) => {
  return Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    data,
    actionUrl,
    isRead: false,
  });
};

export const getUserNotifications = async (
  userId,
  page = 1,
  limit = 20
) => {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);

  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: userId })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
    Notification.countDocuments({ recipient: userId }),
  ]);

  return {
    notifications,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

export const getUnreadNotificationCount = async (userId) => {
  return Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });
};

export const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );

  if (!notification) throw new Error("Notification not found.");
  return notification;
};

export const markAllNotificationsAsRead = async (userId) => {
  return Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) throw new Error("Notification not found.");
  return notification;
};