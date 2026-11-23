import { getGame } from "./gameRegistry.js";

export const validatePlayers = (gameId, players) => {
  const game = getGame(gameId);

  if (!Array.isArray(players)) {
    throw new Error("Players must be an array.");
  }

  if (
    players.length < game.minPlayers ||
    players.length > game.maxPlayers
  ) {
    throw new Error(
      `${game.name} requires ${game.minPlayers}–${game.maxPlayers} players.`
    );
  }

  const normalizedIds = players.map((player) =>
    String(
      typeof player === "object" && player !== null
        ? player.id || player._id
        : player
    )
  );

  if (normalizedIds.some((id) => !id || id === "undefined")) {
    throw new Error("Every player must have a valid ID.");
  }

  if (new Set(normalizedIds).size !== normalizedIds.length) {
    throw new Error("Duplicate players are not allowed.");
  }

  return normalizedIds;
};

export const validatePlayerMembership = (state, userId) => {
  if (!state || !Array.isArray(state.players)) {
    throw new Error("Invalid game state.");
  }

  const id = String(userId);

  if (!state.players.includes(id)) {
    throw new Error("You are not a player in this game.");
  }

  return true;
};

export const validateGameAction = (state, userId, action) => {
  validatePlayerMembership(state, userId);

  if (!action || typeof action !== "object" || Array.isArray(action)) {
    throw new Error("Invalid game action.");
  }

  let serialized;

  try {
    serialized = JSON.stringify(action);
  } catch {
    throw new Error("Game action must contain valid data.");
  }

  if (Buffer.byteLength(serialized, "utf8") > 10_000) {
    throw new Error("Game action is too large.");
  }

  if (state.status !== "playing") {
    throw new Error("This game is not currently active.");
  }

  return true;
};

export const validateGameState = (gameId, state) => {
  const game = getGame(gameId);

  if (!state || typeof state !== "object" || Array.isArray(state)) {
    throw new Error("Invalid game state.");
  }

  if (state.gameId !== gameId) {
    throw new Error("Game state does not match the selected game.");
  }

  if (!Array.isArray(state.players)) {
    throw new Error("Game state has no valid player list.");
  }

  validatePlayers(gameId, state.players);

  if (!["playing", "completed", "draw", "round-completed", "awaiting-word"].includes(state.status)) {
    throw new Error("Invalid game status.");
  }

  return true;
};

export const validateRoomPlayers = (room, userId) => {
  if (!room || !Array.isArray(room.members)) {
    throw new Error("Invalid room.");
  }

  const id = String(userId);

  const isMember = room.members.some((member) => {
    const memberId = member.user?._id || member.user;
    return String(memberId) === id;
  });

  if (!isMember) {
    throw new Error("You are not a member of this room.");
  }

  return true;
};