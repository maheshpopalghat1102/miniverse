import Room from "../models/Room.js";

const normalizeRoomCode = (roomCode) =>
  String(roomCode || "").trim().toUpperCase();

export const getRoom = async (roomCode) => {
  const normalizedCode = normalizeRoomCode(roomCode);

  if (!normalizedCode) throw new Error("Room code is required.");

  const room = await Room.findOne({
    roomCode: normalizedCode,
  }).populate("game host members.user");

  if (!room) throw new Error("Room not found.");

  return room;
};

export const isRoomMember = (room, userId) => {
  const id = String(userId);

  return room.members.some((member) => {
    const memberId = member.user?._id || member.user;
    return String(memberId) === id;
  });
};

export const assertRoomMember = (room, userId) => {
  if (!isRoomMember(room, userId)) {
    throw new Error("You are not a member of this room.");
  }

  return true;
};

export const assertRoomHost = (room, userId) => {
  if (String(room.host?._id || room.host) !== String(userId)) {
    throw new Error("Only the room host can perform this action.");
  }

  return true;
};

export const addMemberToRoom = async (roomCode, userId) => {
  const room = await Room.findOne({
    roomCode: normalizeRoomCode(roomCode),
  });

  if (!room) throw new Error("Room not found.");
  if (room.status !== "waiting") {
    throw new Error("This room is not accepting players.");
  }

  if (isRoomMember(room, userId)) return room;

  if (room.members.length >= room.maxPlayers) {
    throw new Error("Room is full.");
  }

  room.members.push({
    user: userId,
    isReady: false,
  });

  await room.save();

  return room;
};

export const removeMemberFromRoom = async (
  roomCode,
  userId
) => {
  const room = await Room.findOne({
    roomCode: normalizeRoomCode(roomCode),
  });

  if (!room) throw new Error("Room not found.");

  if (!isRoomMember(room, userId)) {
    throw new Error("User is not a room member.");
  }

  room.members = room.members.filter((member) => {
    const memberId = member.user?._id || member.user;
    return String(memberId) !== String(userId);
  });

  if (String(room.host) === String(userId) && room.members.length > 0) {
    room.host = room.members[0].user;
  }

  if (room.members.length === 0) {
    room.status = "closed";
  }

  await room.save();

  return room;
};

export const setMemberReady = async (
  roomCode,
  userId,
  isReady
) => {
  const room = await Room.findOne({
    roomCode: normalizeRoomCode(roomCode),
  });

  if (!room) throw new Error("Room not found.");

  const member = room.members.find((item) => {
    const memberId = item.user?._id || item.user;
    return String(memberId) === String(userId);
  });

  if (!member) throw new Error("You are not a room member.");

  member.isReady = Boolean(isReady);

  await room.save();

  return room;
};

export const areAllPlayersReady = (room) => {
  return (
    room.members.length >= room.minPlayers &&
    room.members.every((member) => member.isReady)
  );
};

export const closeRoom = async (roomCode, userId) => {
  const room = await Room.findOne({
    roomCode: normalizeRoomCode(roomCode),
  });

  if (!room) throw new Error("Room not found.");

  assertRoomHost(room, userId);

  room.status = "closed";
  await room.save();

  return room;
};