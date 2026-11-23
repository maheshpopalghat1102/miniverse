import Room from "../models/Room.js";

const MAX_MESSAGE_LENGTH = 1000;
const MESSAGE_WINDOW_MS = 10_000;
const MAX_MESSAGES_PER_WINDOW = 8;

const sanitizeMessage = (value) => {
  if (typeof value !== "string") return "";

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, MAX_MESSAGE_LENGTH);
};

export const registerChatHandlers = (io, socket) => {
  const messageTimestamps = [];

  socket.on("chat:send", async ({ roomCode, message } = {}, callback) => {
    try {
      const normalizedCode = String(
        roomCode || socket.data.roomCode || ""
      ).trim().toUpperCase();

      if (!normalizedCode || normalizedCode !== socket.data.roomCode) {
        throw new Error("Join a room before sending messages.");
      }

      const cleanMessage = sanitizeMessage(message);

      if (!cleanMessage) {
        throw new Error("Message cannot be empty.");
      }

      const now = Date.now();

      while (
        messageTimestamps.length &&
        now - messageTimestamps[0] > MESSAGE_WINDOW_MS
      ) {
        messageTimestamps.shift();
      }

      if (messageTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
        throw new Error("You are sending messages too quickly.");
      }

      const room = await Room.findOne({
        roomCode: normalizedCode,
      }).select("members status");

      if (!room || room.status === "closed") {
        throw new Error("Room is not available.");
      }

      const isMember = room.members.some(
        (member) => member.user.toString() === socket.user.id
      );

      if (!isMember) {
        throw new Error("You are not a member of this room.");
      }

      messageTimestamps.push(now);

      const chatMessage = {
        id: `${socket.id}-${now}`,
        userId: socket.user.id,
        username: socket.user.username,
        avatar: socket.user.avatar,
        message: cleanMessage,
        createdAt: new Date().toISOString(),
      };

      io.to(`room:${normalizedCode}`).emit("chat:new-message", chatMessage);

      if (typeof callback === "function") {
        callback({ success: true, message: chatMessage });
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