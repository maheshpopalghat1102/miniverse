import { randomInt } from "node:crypto";

export const createInitialState = (players, words) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 8) {
    throw new Error("Draw & Guess requires 2–8 players.");
  }

  if (!Array.isArray(words) || words.length === 0) {
    throw new Error("Drawing words are required.");
  }

  const safeWords = words
    .map((word) => String(word).trim().toLowerCase())
    .filter((word) => /^[a-z ]{2,40}$/.test(word));

  if (!safeWords.length) throw new Error("No valid drawing words.");

  const secretWord = safeWords[randomInt(safeWords.length)];

  return {
    gameId: "draw-guess",
    players: players.map(String),
    drawerIndex: 0,
    secretWord,
    guesses: [],
    round: 1,
    maxRounds: players.length,
    scores: Object.fromEntries(players.map((id) => [String(id), 0])),
    status: "playing",
    winner: null,
  };
};

export const getPrivateDrawerData = (state, userId) => {
  const drawer = state.players[state.drawerIndex];

  if (String(userId) !== drawer) {
    throw new Error("Only the drawer can access the secret word.");
  }

  return {
    secretWord: state.secretWord,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") throw new Error("Game has ended.");

  const drawer = state.players[state.drawerIndex];

  if (id === drawer) throw new Error("The drawer cannot guess their own word.");
  if (!state.players.includes(id)) throw new Error("Not a player.");

  const answer = String(action.answer || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!answer || answer.length > 100) {
    throw new Error("Enter a valid guess.");
  }

  if (state.guesses.some((guess) => guess.userId === id)) {
    throw new Error("You have already guessed this round.");
  }

  const correct = answer === state.secretWord;
  const next = structuredClone(state);

  next.guesses.push({ userId: id, correct });

  if (correct) {
    next.scores[id] += 10;
    next.scores[drawer] += 5;
    next.status = "round-completed";
  } else if (next.guesses.length >= next.players.length - 1) {
    next.status = "round-completed";
  }

  return next;
};

export const startNextRound = (state) => {
  if (state.status !== "round-completed") {
    throw new Error("The current round is not completed.");
  }

  const next = structuredClone(state);

  if (next.round >= next.maxRounds) {
    next.status = "completed";

    const highest = Math.max(...Object.values(next.scores));
    const winners = Object.keys(next.scores).filter(
      (id) => next.scores[id] === highest
    );

    next.winner = winners.length === 1 ? winners[0] : null;
    return next;
  }

  next.round += 1;
  next.drawerIndex = (next.drawerIndex + 1) % next.players.length;
  next.secretWord = null;
  next.guesses = [];
  next.status = "awaiting-word";

  return next;
};

export const setRoundWord = (state, word) => {
  if (state.status !== "awaiting-word") {
    throw new Error("The next round is not ready.");
  }

  const cleanWord = String(word || "").trim().toLowerCase();

  if (!/^[a-z ]{2,40}$/.test(cleanWord)) {
    throw new Error("Invalid drawing word.");
  }

  const next = structuredClone(state);
  next.secretWord = cleanWord;
  next.status = "playing";

  return next;
};

export const getPublicState = (state) => {
  const publicState = structuredClone(state);
  delete publicState.secretWord;
  return publicState;
};

export const isFinished = (state) => state.status === "completed";