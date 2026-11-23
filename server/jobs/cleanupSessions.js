
import RefreshSession from "../models/RefreshSession.js";
import logger from "../utils/logger.js";

export const cleanupSessions = async () => {
  const now = new Date();

  const result = await RefreshSession.deleteMany({
    $or: [
      { expiresAt: { $lte: now } },
      {
        revokedAt: {
          $ne: null,
          $exists: true,
        },
      },
    ],
  });

  const deletedCount = result.deletedCount || 0;

  if (deletedCount > 0) {
    logger.info("Expired refresh sessions cleaned up.", {
      deletedCount,
    });
  }

  return deletedCount;
};

export default cleanupSessions;
