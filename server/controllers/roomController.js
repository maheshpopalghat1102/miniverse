
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

import Room from "../models/Room.js";
import Game from "../models/Game.js";

// ==========================================
// HELPERS
// ==========================================

const getUserId = (req) => {
  return req.user?.id || req.user?._id || null;
};

const normalizeRoomCode = (value) => {
  return String(value || "").trim().toUpperCase();
};

const createRoomCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

const isMember = (room, userId) => {
  if (!room || !userId) return false;

  return room.members.some(
    (member) =>
      String(member.user?._id || member.user) === String(userId) &&
      member.status !== "left"
  );
};

const emitRoomUpdate = (req, room) => {
  const io = req.app.get("io");

  if (!io || !room) return;

  io.to(`room:${room.roomCode}`).emit("room:updated", {
    roomCode: room.roomCode,
    status: room.status,
    currentMatch: room.currentMatch
      ? String(room.currentMatch._id || room.currentMatch)
      : null,
    members: room.members.map((member) => ({
      user: String(member.user?._id || member.user),
      role: member.role,
      status: member.status,
      isReady: Boolean(member.isReady)
    })),
    host: String(room.host?._id || room.host)
  });
};

const getPopulatedRoom = async (roomId) => {
  return Room.findById(roomId)
    .populate("game", "gameId name category thumbnail")
    .populate("host", "username avatar")
    .populate("members.user", "username avatar")
    .lean();
};

const roomError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message
  });
};

// ==========================================
// CREATE ROOM
// ==========================================

export const createRoom = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return roomError(res, 401, "Authentication required.");
    }

    const {
      gameId,
      type = "private",
      maxPlayers = 2,
      settings = {},
      password = "",
      allowSpectators = false
    } = req.body;

    if (!gameId) {
      return roomError(res, 400, "Game ID is required.");
    }

    const game = await Game.findOne({
      gameId,
      isActive: true
    });

    if (!game) {
      return roomError(res, 404, "Game not found or inactive.");
    }

    if (!["public", "private", "friends"].includes(type)) {
      return roomError(res, 400, "Invalid room type.");
    }

    if (
      type === "private" &&
      (typeof password !== "string" || password.length < 4)
    ) {
      return roomError(
        res,
        400,
        "Private rooms require a password of at least 4 characters."
      );
    }

    const capacity = Number(maxPlayers);

    if (
      !Number.isInteger(capacity) ||
      capacity < game.minPlayers ||
      capacity > game.maxPlayers
    ) {
      return roomError(
        res,
        400,
        `Room capacity must be between ${game.minPlayers} and ${game.maxPlayers}.`
      );
    }

    let roomCode;
    let exists = true;

    for (let attempt = 0; attempt < 10 && exists; attempt++) {
      roomCode = createRoomCode();
      exists = await Room.exists({ roomCode });
    }

    if (exists) {
      return roomError(
        res,
        503,
        "Unable to generate a room code. Please try again."
      );
    }

    const passwordHash =
      type === "private"
        ? await bcrypt.hash(password, 10)
        : undefined;

    const room = await Room.create({
      roomCode,
      game: game._id,
      host: userId,
      type,
      maxPlayers: capacity,
      minPlayers: game.minPlayers,
      settings:
        settings && typeof settings === "object"
          ? settings
          : {},
      passwordHash,
      allowSpectators: Boolean(allowSpectators),
      status: "waiting",
      members: [
        {
          user: userId,
          role: "host",
          status: "joined",
          isReady: true
        }
      ]
    });

    const populatedRoom = await getPopulatedRoom(room._id);

    return res.status(201).json({
      success: true,
      message: "Room created successfully.",
      room: populatedRoom
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET ROOM BY CODE
// ==========================================

export const getRoomByCode = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return roomError(res, 401, "Authentication required.");
    }

    const roomCode = normalizeRoomCode(req.params.roomCode);

    if (!roomCode) {
      return roomError(res, 400, "Room code is required.");
    }

    const room = await Room.findOne({
      roomCode,
      expiresAt: { $gt: new Date() },
      status: { $nin: ["closed", "completed"] }
    });

    if (!room) {
      return roomError(res, 404, "Room not found or expired.");
    }

    const member = isMember(room, userId);

    // Private rooms can only be viewed by their members.
    if (room.type === "private" && !member) {
      return roomError(
        res,
        403,
        "You are not authorized to view this private room."
      );
    }

    // Public/friends rooms can be viewed, but only actual
    // members can use the private room controls.
    const populatedRoom = await getPopulatedRoom(room._id);

    return res.status(200).json({
      success: true,
      isMember: member,
      room: populatedRoom
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// JOIN ROOM
// ==========================================

export const joinRoom = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return roomError(res, 401, "Authentication required.");
    }

    const roomCode = normalizeRoomCode(req.params.roomCode);

    const room = await Room.findOne({
      roomCode,
      expiresAt: { $gt: new Date() }
    }).select("+passwordHash");

    if (!room || room.status !== "waiting") {
      return roomError(
        res,
        404,
        "Room is unavailable or the game has already started."
      );
    }

    if (isMember(room, userId)) {
      const populatedRoom = await getPopulatedRoom(room._id);

      return res.status(200).json({
        success: true,
        message: "You are already in this room.",
        room: populatedRoom
      });
    }

    if (room.type === "private") {
      const password = req.body?.password;

      if (
        !password ||
        !room.passwordHash ||
        !(await bcrypt.compare(password, room.passwordHash))
      ) {
        return roomError(res, 403, "The room password is incorrect.");
      }
    }

    const activeMembers = room.members.filter(
      (member) => member.status !== "left"
    );

    if (activeMembers.length >= room.maxPlayers) {
      return roomError(res, 409, "Room is full.");
    }

    room.members.push({
      user: userId,
      role: "player",
      status: "joined",
      isReady: false
    });

    await room.save();

    emitRoomUpdate(req, room);

    const populatedRoom = await getPopulatedRoom(room._id);

    return res.status(200).json({
      success: true,
      message: "Joined room successfully.",
      room: populatedRoom
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// LEAVE ROOM
// ==========================================

export const leaveRoom = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return roomError(res, 401, "Authentication required.");
    }

    const roomCode = normalizeRoomCode(req.params.roomCode);

    const room = await Room.findOne({ roomCode });

    if (!room || !isMember(room, userId)) {
      return roomError(
        res,
        404,
        "Room or membership not found."
      );
    }

    // Do not allow leaving an active match through the lobby
    // endpoint. Handle match abandonment separately.
    if (room.status === "playing") {
      return roomError(
        res,
        409,
        "A match is active. Leave the match using the game screen."
      );
    }

    room.members = room.members.filter(
      (member) =>
        String(member.user) !== String(userId)
    );

    if (String(room.host) === String(userId)) {
      const nextHost = room.members.find(
        (member) => member.role !== "spectator"
      );

      if (nextHost) {
        room.host = nextHost.user;
        nextHost.role = "host";
      } else {
        room.status = "closed";
        room.closedAt = new Date();
      }
    }

    await room.save();

    if (room.status === "closed") {
      req.app.get("io")
        ?.to(`room:${room.roomCode}`)
        .emit("room:closed", {
          roomCode: room.roomCode
        });
    } else {
      emitRoomUpdate(req, room);
    }

    return res.status(200).json({
      success: true,
      message: "Left room successfully."
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SET READY STATUS
// ==========================================

export const setReadyStatus = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return roomError(res, 401, "Authentication required.");
    }

    const { isReady } = req.body;

    if (typeof isReady !== "boolean") {
      return roomError(
        res,
        400,
        "isReady must be true or false."
      );
    }

    const roomCode = normalizeRoomCode(req.params.roomCode);

    const room = await Room.findOne({
      roomCode,
      status: "waiting",
      expiresAt: { $gt: new Date() },
      members: {
        $elemMatch: {
          user: userId,
          status: { $ne: "left" }
        }
      }
    });

    if (!room) {
      return roomError(
        res,
        404,
        "Waiting room or membership not found."
      );
    }

    const member = room.members.find(
      (item) =>
        String(item.user) === String(userId) &&
        item.status !== "left"
    );

    if (!member) {
      return roomError(res, 404, "Room member not found.");
    }

    member.isReady = isReady;
    member.status = isReady ? "ready" : "joined";

    await room.save();

    emitRoomUpdate(req, room);

    return res.status(200).json({
      success: true,
      message: "Ready status updated.",
      isReady,
      roomCode
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CLOSE ROOM
// ==========================================

export const closeRoom = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return roomError(res, 401, "Authentication required.");
    }

    const roomCode = normalizeRoomCode(req.params.roomCode);

    const room = await Room.findOne({
      roomCode,
      host: userId
    });

    if (!room) {
      return roomError(
        res,
        404,
        "Room not found or you are not the host."
      );
    }

    if (room.status === "playing") {
      return roomError(
        res,
        409,
        "Cannot close a room while a match is active."
      );
    }

    room.status = "closed";
    room.closedAt = new Date();

    await room.save();

    req.app.get("io")
      ?.to(`room:${room.roomCode}`)
      .emit("room:closed", {
        roomCode: room.roomCode
      });

    return res.status(200).json({
      success: true,
      message: "Room closed successfully."
    });
  } catch (error) {
    next(error);
  }
};
