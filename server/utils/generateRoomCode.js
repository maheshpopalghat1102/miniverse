
import crypto from "node:crypto";

const ROOM_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const generateRoomCode = (length = 6) => {
  if (!Number.isInteger(length) || length < 5 || length > 12) {
    throw new Error("Room code length must be between 5 and 12.");
  }

  let code = "";

  for (let i = 0; i < length; i += 1) {
    const index = crypto.randomInt(0, ROOM_CHARACTERS.length);
    code += ROOM_CHARACTERS[index];
  }

  return code;
};

export const generateUniqueRoomCode = async (
  RoomModel,
  maxAttempts = 10
) => {
  if (!RoomModel || typeof RoomModel.exists !== "function") {
    throw new Error("A valid Room model is required.");
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const roomCode = generateRoomCode();

    const existingRoom = await RoomModel.exists({
      roomCode,
      status: { $ne: "closed" },
    });

    if (!existingRoom) {
      return roomCode;
    }
  }

  throw new Error("Unable to generate a unique room code. Try again.");
};
