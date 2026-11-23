import Room from "../models/Room.js";

const MAX_ACTION_SIZE = 10_000;

const isValidAction = (action) => {
  if (!action || typeof action !== "object" || Array.isArray(action)) {
    return false;
  }

  try {
    return Buffer.byteLength(JSON.stringify(action), "utf8") <= MAX_ACTION_SIZE;
  } catch {
    return false;
  }
};

export const registerGameHandlers = (io, socket) => {
  socket.on("game:action", async ({ roomCode, action } = {}, callback) => {
    try {
      const normalizedCode = String(
        roomCode || socket.data.roomCode || ""
      ).trim().toUpperCase();

      if (!normalizedCode || normalizedCode !== socket.data.roomCode) {
        throw new Error("Join the game room before sending an action.");
      }

      if (!isValidAction(action)) {
        throw new Error("Invalid game action.");
      }

      const room = await Room.findOne({
        roomCode: normalizedCode,
      }).select("members status");

      if (!room || room.status !== "playing") {
        throw new Error("This game is not currently active.");
      }

      const isMember = room.members.some(
        (member) => member.user.toString() === socket.user.id
      );

      if (!isMember) {
        throw new Error("You are not a member of this game.");
      }

      // This is a transport relay only.
      // A game-specific server engine must validate the action.
      socket.to(`room:${normalizedCode}`).emit("game:action-received", {
        userId: socket.user.id,
        action,
        timestamp: Date.now(),
      });

      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      socket.emit("socket:error", {
        success: false,
        message: error.message,
      });

      if (typeof callback === "function") {
        callback({ success: false, message: error.message });
      }
    }
  });
};