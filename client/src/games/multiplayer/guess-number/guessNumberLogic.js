
export const DEFAULT_MIN_NUMBER = 1;
export const DEFAULT_MAX_NUMBER = 100;

export function generateSecretNumber(
  min = DEFAULT_MIN_NUMBER,
  max = DEFAULT_MAX_NUMBER
) {
  validateRange(min, max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function validateRange(min, max) {
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min >= max
  ) {
    throw new Error("Invalid number range.");
  }

  if (max - min > 1000000) {
    throw new Error("Number range is too large.");
  }

  return true;
}

export function validateGuess(guess, min, max) {
  const value = Number(guess);

  if (!Number.isInteger(value)) {
    return {
      valid: false,
      message: "Enter a whole number.",
    };
  }

  if (value < min || value > max) {
    return {
      valid: false,
      message: `Enter a number between ${min} and ${max}.`,
    };
  }

  return {
    valid: true,
    value,
    message: "",
  };
}

export function getGuessHint(guess, secretNumber) {
  if (guess === secretNumber) return "correct";
  if (guess > secretNumber) return "high";
  return "low";
}

export function createInitialGuessState(options = {}) {
  const min = options.min ?? DEFAULT_MIN_NUMBER;
  const max = options.max ?? DEFAULT_MAX_NUMBER;

  validateRange(min, max);

  return {
    min,
    max,
    currentPlayer: "X",
    status: "playing",
    winner: null,
    attempts: {
      X: 0,
      O: 0,
    },
    history: [],
    totalAttempts: 0,
  };
}

export function applyGuess(state, guess, secretNumber) {
  if (!state || state.status !== "playing") {
    throw new Error("The game is not active.");
  }

  const validation = validateGuess(
    guess,
    state.min,
    state.max
  );

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (
    !Number.isInteger(secretNumber) ||
    secretNumber < state.min ||
    secretNumber > state.max
  ) {
    throw new Error("Invalid secret number.");
  }

  const player = state.currentPlayer;
  const hint = getGuessHint(validation.value, secretNumber);

  const historyEntry = {
    player,
    guess: validation.value,
    hint,
    attempt: state.attempts[player] + 1,
  };

  const attempts = {
    ...state.attempts,
    [player]: state.attempts[player] + 1,
  };

  const isCorrect = hint === "correct";

  return {
    ...state,
    attempts,
    history: [...state.history, historyEntry],
    totalAttempts: state.totalAttempts + 1,
    status: isCorrect ? "finished" : "playing",
    winner: isCorrect ? player : null,
    currentPlayer: isCorrect
      ? player
      : player === "X"
        ? "O"
        : "X",
  };
}

export function getHintLabel(hint) {
  const labels = {
    high: "Too High ↑",
    low: "Too Low ↓",
    correct: "Correct! 🎉",
  };

  return labels[hint] || "Unknown";
}
