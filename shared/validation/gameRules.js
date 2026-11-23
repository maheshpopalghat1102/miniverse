
import {
  ALL_GAME_IDS,
  MULTIPLAYER_GAME_IDS,
  SINGLE_PLAYER_GAME_IDS,
  TURN_BY_TURN_GAME_IDS,
} from "../constants/gameIds.js";

import {
  GAME_MODES,
  GAME_DIFFICULTIES,
} from "../constants/gameModes.js";

export const GAME_RULES = Object.freeze({
  MIN_PLAYERS: 1,
  MAX_PLAYERS: 20,
  MAX_ACTION_FIELDS: 20,
  MAX_ACTION_STRING_LENGTH: 500,
});

export const isValidGameId = (gameId) => {
  return typeof gameId === "string" && ALL_GAME_IDS.includes(gameId);
};

export const isMultiplayerGame = (gameId) => {
  return MULTIPLAYER_GAME_IDS.includes(gameId);
};

export const isSinglePlayerGame = (gameId) => {
  return SINGLE_PLAYER_GAME_IDS.includes(gameId);
};

export const isTurnByTurnGame = (gameId) => {
  return TURN_BY_TURN_GAME_IDS.includes(gameId);
};

export const isValidGameMode = (mode) => {
  return Object.values(GAME_MODES).includes(mode);
};

export const isValidDifficulty = (difficulty) => {
  return Object.values(GAME_DIFFICULTIES).includes(difficulty);
};

export const validatePlayerCount = (
  playerCount,
  minPlayers,
  maxPlayers
) => {
  if (!Number.isInteger(playerCount)) {
    return { valid: false, message: "Player count must be an integer." };
  }

  if (
    !Number.isInteger(minPlayers) ||
    !Number.isInteger(maxPlayers) ||
    minPlayers < 1 ||
    maxPlayers > GAME_RULES.MAX_PLAYERS ||
    minPlayers > maxPlayers
  ) {
    return { valid: false, message: "Invalid game player limits." };
  }

  if (playerCount < minPlayers || playerCount > maxPlayers) {
    return {
      valid: false,
      message: `Player count must be between ${minPlayers} and ${maxPlayers}.`,
    };
  }

  return { valid: true, message: "Valid player count." };
};

export const validateGameActionShape = (action) => {
  if (
    !action ||
    typeof action !== "object" ||
    Array.isArray(action)
  ) {
    return { valid: false, message: "Action must be an object." };
  }

  const keys = Object.keys(action);

  if (keys.length === 0 || keys.length > GAME_RULES.MAX_ACTION_FIELDS) {
    return { valid: false, message: "Invalid action field count." };
  }

  for (const value of Object.values(action)) {
    if (typeof value === "string" &&
        value.length > GAME_RULES.MAX_ACTION_STRING_LENGTH) {
      return { valid: false, message: "Action text is too long." };
    }

    if (
      value !== null &&
      typeof value === "object"
    ) {
      return {
        valid: false,
        message: "Nested action objects are not allowed.",
      };
    }
  }

  return { valid: true, message: "Valid action structure." };
};
