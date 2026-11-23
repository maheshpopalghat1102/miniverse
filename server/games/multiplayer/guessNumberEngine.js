import { randomInt } from "node:crypto";

export const createInitialState = (players, options = {}) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 6) {
    throw new Error("Guess Number requires 2–6 players.");
  }

  const min = Number(options.min ?? 1);
  const max = Number(options.max ?? 100);

  if (!Number.isInteger(min) || !Number.isInteger(max) || max <= min) {
    throw new Error("Invalid number range.");
  }

  return {
    gameId: "guess-number",
    players: players.map(String),
    secret: randomInt(min, max + 1),
    min,
    max,
    currentTurn: String(players[0]),
    attempts: [],
    maxAttempts: Number(options.maxAttempts) || 20,
    status: "playing",
    winner: null,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") throw new Error("Game has ended.");
  if (state.currentTurn !== id) throw new Error("Not your turn.");

  const guess = Number(action.guess);

  if (!Number.isInteger(guess) || guess < state.min || guess > state.max) {
    throw new Error(`Enter a whole number from ${state.min} to ${state.max}.`);
  }

  const next = structuredClone(state);

  next.attempts.push({
    userId: id,
    guess,
    result: guess === state.secret
      ? "correct"
      : guess < state.secret
        ? "higher"
        : "lower",
  });

  if (guess === state.secret) {
    next.status = "completed";
    next.winner = id;
  } else if (next.attempts.length >= next.maxAttempts) {
    next.status = "completed";
    next.winner = null;
  } else {
    const currentIndex = next.players.indexOf(id);
    next.currentTurn = next.players[(currentIndex + 1) % next.players.length];
  }

  return next;
};

export const getPublicState = (state) => {
  const publicState = structuredClone(state);
  delete publicState.secret;

  if (state.status === "completed") {
    publicState.secret = state.secret;
  }

  return publicState;
};

export const isFinished = (state) => state.status !== "playing";