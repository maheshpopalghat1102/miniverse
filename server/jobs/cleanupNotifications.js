
import Notification from "../models/Notification.js";
import logger from "../utils/logger.js";

const DEFAULT_RETENTION_DAYS = 90;

export const cleanupNotifications = async () => {
  const retentionDays = Number(
    process.env.READ_NOTIFICATION_RETENTION_DAYS ||
      DEFAULT_RETENTION_DAYS
  );

  if (!Number.isFinite(retentionDays) || retentionDays < 1) {
    throw new Error(
      "Invalid READ_NOTIFICATION_RETENTION_DAYS setting."
    );
  }

  const cutoff = new Date(
    Date.now() - retentionDays * 24 * 60 * 60 * 1000
  );

  const result = await Notification.deleteMany({
    isRead: true,
    readAt: {
      $ne: null,
      $lte: cutoff,
    },
  });

  const deletedCount = result.deletedCount || 0;

  if (deletedCount > 0) {
    logger.info("Old read notifications cleaned up.", {
      deletedCount,
      retentionDays,
    });
  }

  return deletedCount;
};

export default cleanupNotifications;
