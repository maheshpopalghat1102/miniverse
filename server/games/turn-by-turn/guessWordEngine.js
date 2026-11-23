import { randomInt } from "node:crypto";

const MAX_WRONG_GUESSES = 6;

const normalizeWord = (word) =>
  String(word).trim().toLowerCase();

export const createInitialState = (players, words) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 6) {
    throw new Error("Guess the Word requires 2–6 players.");
  }

  if (!Array.isArray(words) || words.length === 0) {
    throw new Error("A word list is required.");
  }

  const validWords = words
    .map(normalizeWord)
    .filter((word) => /^[a-z]{3,20}$/.test(word));

  if (validWords.length === 0) {
    throw new Error("No valid words available.");
  }

  const secretWord = validWords[randomInt(validWords.length)];

  return {
    gameId: "guess-the-word",
    players: players.map(String),
    secretWord,
    revealedLetters: [],
    guessedLetters: [],
    wrongGuesses: 0,
    maxWrongGuesses: MAX_WRONG_GUESSES,
    currentTurnIndex: 0,
    scores: Object.fromEntries(
      players.map((id) => [String(id), 0])
    ),
    status: "playing",
    winner: null,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") {
    throw new Error("Game has ended.");
  }

  if (state.players[state.currentTurnIndex] !== id) {
    throw new Error("Not your turn.");
  }

  const letter = String(action.letter || "").trim().toLowerCase();

  if (!/^[a-z]$/.test(letter)) {
    throw new Error("Enter exactly one letter.");
  }

  if (state.guessedLetters.includes(letter)) {
    throw new Error("This letter has already been guessed.");
  }

  const next = structuredClone(state);

  next.guessedLetters.push(letter);

  if (next.secretWord.includes(letter)) {
    next.revealedLetters.push(letter);
  } else {
    next.wrongGuesses += 1;
  }

  const allLettersRevealed = [...new Set(next.secretWord)].every(
    (character) => next.revealedLetters.includes(character)
  );

  if (allLettersRevealed) {
    next.status = "completed";
    next.winner = id;
    next.scores[id] += 10;
  } else if (next.wrongGuesses >= next.maxWrongGuesses) {
    next.status = "completed";
    next.winner = null;
  } else {
    next.currentTurnIndex =
      (next.currentTurnIndex + 1) % next.players.length;
  }

  return next;
};

export const getPublicState = (state) => {
  const publicState = structuredClone(state);

  if (state.status === "playing") {
    delete publicState.secretWord;
  }

  publicState.displayWord = [...state.secretWord]
    .map((letter) =>
      state.revealedLetters.includes(letter) ? letter : "_"
    )
    .join(" ");

  return publicState;
};

export const isFinished = (state) => state.status !== "playing";