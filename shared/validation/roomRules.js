
import {
  ROOM_TYPES,
  ROOM_STATUSES,
} from "../constants/gameModes.js";

import { isValidGameId } from "../constants/gameIds.js";

export const ROOM_RULES = Object.freeze({
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 20,
  CODE_LENGTH: 6,
  MIN_PASSWORD_LENGTH: 4,
  MAX_PASSWORD_LENGTH: 64,
  MAX_ROOM_NAME_LENGTH: 40,
});

export const isValidRoomType = (type) => {
  return Object.values(ROOM_TYPES).includes(type);
};

export const isValidRoomStatus = (status) => {
  return Object.values(ROOM_STATUSES).includes(status);
};

export const validateRoomCode = (roomCode) => {
  if (typeof roomCode !== "string") {
    return { valid: false, message: "Room code must be a string." };
  }

  const normalizedCode = roomCode.trim().toUpperCase();

  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(normalizedCode)) {
    return { valid: false, message: "Invalid room code." };
  }

  return {
    valid: true,
    message: "Valid room code.",
    value: normalizedCode,
  };
};

export const validateRoomSettings = (settings = {}) => {
  if (
    !settings ||
    typeof settings !== "object" ||
    Array.isArray(settings)
  ) {
    return { valid: false, message: "Room settings must be an object." };
  }

  const allowedFields = [
    "maxPlayers",
    "minPlayers",
    "isPrivate",
    "allowSpectators",
    "chatEnabled",
  ];

  const unknownFields = Object.keys(settings).filter(
    (key) => !allowedFields.includes(key)
  );

  if (unknownFields.length > 0) {
    return {
      valid: false,
      message: `Unsupported settings: ${unknownFields.join(", ")}`,
    };
  }

  return { valid: true, message: "Valid room settings." };
};

export const validateRoomCreation = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { valid: false, message: "Room data must be an object." };
  }

  if (!isValidGameId(data.gameId)) {
    return { valid: false, message: "Invalid game ID." };
  }

  if (!isValidRoomType(data.type)) {
    return { valid: false, message: "Invalid room type." };
  }

  const minPlayers = data.minPlayers ?? 2;
  const maxPlayers = data.maxPlayers ?? 8;

  if (
    !Number.isInteger(minPlayers) ||
    !Number.isInteger(maxPlayers) ||
    minPlayers < ROOM_RULES.MIN_PLAYERS ||
    maxPlayers > ROOM_RULES.MAX_PLAYERS ||
    minPlayers > maxPlayers
  ) {
    return { valid: false, message: "Invalid room player limits." };
  }

  if (data.type === ROOM_TYPES.PRIVATE) {
    if (
      typeof data.password !== "string" ||
      data.password.length < ROOM_RULES.MIN_PASSWORD_LENGTH ||
      data.password.length > ROOM_RULES.MAX_PASSWORD_LENGTH
    ) {
      return {
        valid: false,
        message: "Private rooms require a valid password.",
      };
    }
  }

  const settingsResult = validateRoomSettings(data.settings ?? {});

  if (!settingsResult.valid) {
    return settingsResult;
  }

  return { valid: true, message: "Valid room creation data." };
};
