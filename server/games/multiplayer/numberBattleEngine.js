import { randomInt } from "node:crypto";

export const createInitialState = (players, options = {}) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 6) {
    throw new Error("Number Battle requires 2–6 players.");
  }

  const min = Number(options.min ?? 1);
  const max = Number(options.max ?? 50);
  const target = Number(options.target ?? randomInt(min, max + 1));

  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    !Number.isInteger(target) ||
    max < min ||
    target < min ||
    target > max
  ) {
    throw new Error("Invalid Number Battle settings.");
  }

  return {
    gameId: "number-battle",
    players: players.map(String),
    min,
    max,
    target,
    currentTurnIndex: 0,
    choices: {},
    scores: Object.fromEntries(players.map((id) => [String(id), 0])),
    status: "playing",
    winner: null,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") throw new Error("Game has ended.");
  if (state.players[state.currentTurnIndex] !== id) {
    throw new Error("Not your turn.");
  }

  const number = Number(action.number);

  if (
    !Number.isInteger(number) ||
    number < state.min ||
    number > state.max
  ) {
    throw new Error(`Choose a whole number from ${state.min} to ${state.max}.`);
  }

  const next = structuredClone(state);

  next.choices[id] = number;
  next.currentTurnIndex += 1;

  if (next.currentTurnIndex >= next.players.length) {
    let closestDistance = Infinity;

    for (const playerId of next.players) {
      const distance = Math.abs(next.choices[playerId] - next.target);

      if (distance < closestDistance) closestDistance = distance;
    }

    const winners = next.players.filter(
      (playerId) =>
        Math.abs(next.choices[playerId] - next.target) === closestDistance
    );

    for (const playerId of winners) {
      next.scores[playerId] += 10;
    }

    next.status = "completed";
    next.winner = winners.length === 1 ? winners[0] : null;
  }

  return next;
};

export const getPublicState = (state) => {
  const publicState = structuredClone(state);

  if (state.status !== "completed") {
    delete publicState.target;
  }

  return publicState;
};

export const isFinished = (state) => state.status !== "playing";