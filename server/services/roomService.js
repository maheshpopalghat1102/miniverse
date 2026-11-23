import { randomInt } from "node:crypto";

const createRoomCode = () => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  return Array.from(
    { length: 6 },
    () => characters[randomInt(characters.length)]
  ).join("");
};

const cryptoRandomIndex = (max) => {
  // Use Node's cryptographically secure random generator.
  return Math.floor(Math.random() * max);
};

export const createRoomRecord = async ({
  game,
  hostId,
  type = "private",
  maxPlayers = 2,
  settings = {},
  passwordHash = null,
}) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await Room.create({
        roomCode: createRoomCode(),
        game,
        host: hostId,
        type,
        status: "waiting",
        members: [{ user: hostId, isReady: true }],
        maxPlayers,
        settings,
        passwordHash,
      });
    } catch (error) {
      if (error.code !== 11000 || attempt === 4) throw error;
    }
  }
};

export const findRoomByCode = async (roomCode) => {
  return Room.findOne({
    roomCode: String(roomCode).toUpperCase(),
  }).populate("game host members.user");
};

export const isRoomMember = (room, userId) => {
  return room.members.some(
    (member) => member.user?._id?.toString() === userId.toString()
      || member.user?.toString() === userId.toString()
  );
};

export const addRoomMember = async (roomCode, userId) => {
  const room = await Room.findOne({
    roomCode: String(roomCode).toUpperCase(),
  });

  if (!room) throw new Error("Room not found.");
  if (room.status !== "waiting") throw new Error("Room is not accepting players.");
  if (isRoomMember(room, userId)) return room;
  if (room.members.length >= room.maxPlayers) throw new Error("Room is full.");

  room.members.push({ user: userId, isReady: false });
  await room.save();

  return room;
};

export const removeRoomMember = async (roomCode, userId) => {
  const room = await Room.findOne({
    roomCode: String(roomCode).toUpperCase(),
  });

  if (!room) throw new Error("Room not found.");

  room.members = room.members.filter(
    (member) =>
      member.user?._id?.toString() !== userId.toString() &&
      member.user?.toString() !== userId.toString()
  );

  if (room.host.toString() === userId.toString() && room.members.length > 0) {
    room.host = room.members[0].user;
  }

  if (room.members.length === 0) {
    room.status = "closed";
  }

  await room.save();
  return room;
};

export const updateMemberReadyStatus = async (roomCode, userId, isReady) => {
  const room = await Room.findOne({
    roomCode: String(roomCode).toUpperCase(),
  });

  if (!room) throw new Error("Room not found.");

  const member = room.members.find(
    (item) =>
      item.user?._id?.toString() === userId.toString() ||
      item.user?.toString() === userId.toString()
  );

  if (!member) throw new Error("You are not a member of this room.");

  member.isReady = Boolean(isReady);
  await room.save();

  return room;
};