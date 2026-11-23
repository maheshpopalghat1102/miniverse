
import {
  GAME_CONFIG,
  GAME_CATEGORIES,
  getGameConfig,
  getGamesByCategory,
} from "../config/gameConfig";

export function getGameById(gameId) {
  return getGameConfig(gameId);
}

export function getGameName(gameId) {
  return getGameConfig(gameId)?.name || "Unknown Game";
}

export function getGameCategory(gameId) {
  return getGameConfig(gameId)?.category || null;
}

export function getGamePlayers(gameId) {
  const game = getGameConfig(gameId);

  if (!game) return null;

  return {
    minPlayers: game.minPlayers,
    maxPlayers: game.maxPlayers,
  };
}

export function canJoinGame(gameId, playerCount) {
  const game = getGameConfig(gameId);

  if (!game || !Number.isInteger(playerCount)) return false;

  return playerCount < game.maxPlayers;
}

export function hasMinimumPlayers(gameId, playerCount) {
  const game = getGameConfig(gameId);

  return Boolean(
    game &&
    Number.isInteger(playerCount) &&
    playerCount >= game.minPlayers
  );
}

export function canStartGame(gameId, playerCount) {
  const game = getGameConfig(gameId);

  if (!game || !Number.isInteger(playerCount)) return false;

  return (
    playerCount >= game.minPlayers &&
    playerCount <= game.maxPlayers
  );
}

export function getMultiplayerGames() {
  return getGamesByCategory(GAME_CATEGORIES.MULTIPLAYER);
}

export function getSinglePlayerGames() {
  return getGamesByCategory(GAME_CATEGORIES.SINGLE_PLAYER);
}

export function getTurnByTurnGames() {
  return getGamesByCategory(GAME_CATEGORIES.TURN_BY_TURN);
}

export function getFeaturedGames() {
  return GAME_CONFIG.filter((game) => game.featured);
}

export function normalizePlayer(player) {
  if (!player) return null;

  return {
    ...player,
    id: String(player.id || player._id || ""),
    name:
      player.name ||
      player.username ||
      player.displayName ||
      "Player",
  };
}

export function normalizePlayers(players = []) {
  if (!Array.isArray(players)) return [];

  return players
    .map(normalizePlayer)
    .filter((player) => player && player.id);
}

export function findPlayerById(players, playerId) {
  return normalizePlayers(players).find(
    (player) => player.id === String(playerId)
  ) || null;
}

export function getPlayerScore(player) {
  const score = Number(player?.score);

  return Number.isFinite(score) ? score : 0;
}

export function calculateTotalScore(scores = []) {
  if (!Array.isArray(scores)) return 0;

  return scores.reduce((total, item) => {
    const score = Number(item?.score ?? item);

    return total + (
      Number.isFinite(score) ? score : 0
    );
  }, 0);
}

export function sortPlayersByScore(players = [], descending = true) {
  return normalizePlayers(players).sort((a, b) => {
    const difference = getPlayerScore(a) - getPlayerScore(b);

    return descending ? -difference : difference;
  });
}

export function getLeaderboard(players = []) {
  return sortPlayersByScore(players).map((player, index) => ({
    ...player,
    rank: index + 1,
  }));
}

export function getGameResult(players = []) {
  const leaderboard = getLeaderboard(players);

  if (!leaderboard.length) {
    return {
      winner: null,
      isDraw: false,
      leaderboard: [],
    };
  }

  const highestScore = getPlayerScore(leaderboard[0]);

  const winners = leaderboard.filter(
    (player) => getPlayerScore(player) === highestScore
  );

  return {
    winner: winners.length === 1 ? winners[0] : null,
    isDraw: winners.length > 1,
    leaderboard,
  };
}

export function getGameStatusLabel(status) {
  const labels = {
    idle: "Not Started",
    waiting: "Waiting for Players",
    ready: "Ready",
    playing: "Playing",
    paused: "Paused",
    roundResult: "Round Complete",
    finished: "Finished",
    cancelled: "Cancelled",
    abandoned: "Abandoned",
  };

  return labels[status] || "Unknown Status";
}

export function isGameFinished(status) {
  return ["finished", "cancelled", "abandoned"].includes(status);
}

export function getGameProgress(currentRound, totalRounds) {
  const total = Number(totalRounds);
  const current = Number(currentRound);

  if (
    !Number.isFinite(total) ||
    !Number.isFinite(current) ||
    total <= 0
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, (current / total) * 100)
  );
}

export function getRandomGame(games = GAME_CONFIG) {
  if (!Array.isArray(games) || games.length === 0) {
    return null;
  }

  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("Secure random generation is unavailable.");
  }

  const values = new Uint32Array(1);
  const max = games.length;
  const range = 0x100000000;
  const limit = range - (range % max);

  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);

  return games[values[0] % max];
}
