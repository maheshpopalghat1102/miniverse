
export const GAME_CATEGORIES = Object.freeze({
  MULTIPLAYER: "multiplayer",
  SINGLE_PLAYER: "single-player",
  TURN_BY_TURN: "turn-by-turn",
});

export const GAME_MODES = Object.freeze({
  CASUAL: "casual",
  RANKED: "ranked",
  PRIVATE: "private",
  SINGLE_PLAYER: "single-player",
});

export const ROOM_TYPES = Object.freeze({
  PUBLIC: "public",
  PRIVATE: "private",
});

export const ROOM_STATUSES = Object.freeze({
  WAITING: "waiting",
  PLAYING: "playing",
  COMPLETED: "completed",
  CLOSED: "closed",
});

export const MATCH_STATUSES = Object.freeze({
  WAITING: "waiting",
  PLAYING: "playing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DRAW: "draw",
});

export const PLAYER_LIMITS = Object.freeze({
  MIN: 1,
  MAX: 20,
  DEFAULT_ROOM_MAX: 8,
});

export const GAME_DIFFICULTIES = Object.freeze({
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
});
