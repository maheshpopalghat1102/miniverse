import Room from "../models/Room.js";

const emitError = (socket, message) => {
  socket.emit("socket:error", {
    success: false,
    message,
  });
};

export const registerRoomHandlers = (io, socket) => {
  socket.on("room:join", async ({ roomCode } = {}, callback) => {
    try {
      if (!roomCode || typeof roomCode !== "string") {
        throw new Error("A valid room code is required.");
      }

      const normalizedCode = roomCode.trim().toUpperCase();

      const room = await Room.findOne({
        roomCode: normalizedCode,
      }).select("roomCode members status");

      if (!room) throw new Error("Room not found.");

      if (room.status === "closed" || room.status === "completed") {
        throw new Error("This room is no longer active.");
      }

      const isMember = room.members.some(
        (member) => member.user.toString() === socket.user.id
      );

      if (!isMember) {
        throw new Error("You are not a member of this room.");
      }

      const socketRoom = `room:${normalizedCode}`;

      await socket.join(socketRoom);
      socket.data.roomCode = normalizedCode;

      socket.to(socketRoom).emit("room:member-joined", {
        user: socket.user,
      });

      const result = {
        success: true,
        roomCode: normalizedCode,
      };

      if (typeof callback === "function") callback(result);
    } catch (error) {
      emitError(socket, error.message);

      if (typeof callback === "function") {
        callback({ success: false, message: error.message });
      }
    }
  });

  socket.on("room:leave", async ({ roomCode } = {}, callback) => {
    try {
      const normalizedCode = String(
        roomCode || socket.data.roomCode || ""
      ).trim().toUpperCase();

      if (!normalizedCode) {
        throw new Error("Room code is required.");
      }

      const socketRoom = `room:${normalizedCode}`;

      await socket.leave(socketRoom);

      if (socket.data.roomCode === normalizedCode) {
        delete socket.data.roomCode;
      }

      socket.to(socketRoom).emit("room:member-left", {
        userId: socket.user.id,
      });

      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      emitError(socket, error.message);

      if (typeof callback === "function") {
        callback({ success: false, message: error.message });
      }
    }
  });
};