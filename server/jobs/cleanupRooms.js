
import Room from "../models/Room.js";
import logger from "../utils/logger.js";

const DEFAULT_WAITING_ROOM_HOURS = 24;

export const cleanupRooms = async () => {
  const now = new Date();

  const waitingRoomHours = Number(
    process.env.WAITING_ROOM_RETENTION_HOURS ||
      DEFAULT_WAITING_ROOM_HOURS
  );

  if (!Number.isFinite(waitingRoomHours) || waitingRoomHours < 1) {
    throw new Error("Invalid WAITING_ROOM_RETENTION_HOURS setting.");
  }

  const waitingRoomCutoff = new Date(
    now.getTime() - waitingRoomHours * 60 * 60 * 1000
  );

  const result = await Room.deleteMany({
    $or: [
      { expiresAt: { $lte: now } },
      {
        status: "waiting",
        createdAt: { $lte: waitingRoomCutoff },
      },
    ],
  });

  const deletedCount = result.deletedCount || 0;

  if (deletedCount > 0) {
    logger.info("Expired rooms cleaned up.", { deletedCount });
  }

  return deletedCount;
};

export default cleanupRooms;
