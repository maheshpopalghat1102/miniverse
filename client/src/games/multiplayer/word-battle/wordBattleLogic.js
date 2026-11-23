
export const DEFAULT_TURN_TIME = 30;
export const DEFAULT_MAX_ROUNDS = 10;

export function normalizeWord(word) {
  return String(word ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

export function validateWordFormat(word) {
  const normalized = normalizeWord(word);

  if (!normalized) {
    return {
      valid: false,
      message: "Enter a word.",
    };
  }

  if (normalized.length < 2) {
    return {
      valid: false,
      message: "Word must contain at least 2 letters.",
    };
  }

  if (normalized.length > 20) {
    return {
      valid: false,
      message: "Word cannot exceed 20 letters.",
    };
  }

  return {
    valid: true,
    word: normalized,
    message: "",
  };
}

export function getLastLetter(word) {
  const normalized = normalizeWord(word);
  return normalized ? normalized.at(-1) : "";
}

export function getNextRequiredLetter(lastWord) {
  return getLastLetter(lastWord);
}

export function validateWord(word, state, options = {}) {
  const format = validateWordFormat(word);

  if (!format.valid) return format;

  const normalized = format.word;
  const usedWords = state?.usedWords ?? [];
  const previousWord = state?.lastWord ?? "";
  const requiredLetter = getNextRequiredLetter(previousWord);

  if (usedWords.includes(normalized)) {
    return {
      valid: false,
      message: "This word has already been used.",
    };
  }

  if (
    requiredLetter &&
    !normalized.startsWith(requiredLetter)
  ) {
    return {
      valid: false,
      message: `Your word must start with "${requiredLetter.toUpperCase()}".`,
    };
  }

  if (
    typeof options.isDictionaryWord === "function" &&
    !options.isDictionaryWord(normalized)
  ) {
    return {
      valid: false,
      message: "This word is not in the accepted dictionary.",
    };
  }

  return {
    valid: true,
    word: normalized,
    message: "",
  };
}

export function calculateWordScore(word) {
  const normalized = normalizeWord(word);

  if (!normalized) return 0;

  const lengthScore = normalized.length * 2;
  const uniqueLetterScore = new Set(normalized).size;
  const bonus = normalized.length >= 8 ? 5 : 0;

  return lengthScore + uniqueLetterScore + bonus;
}

export function createInitialWordBattleState(options = {}) {
  const maxRounds = options.maxRounds ?? DEFAULT_MAX_ROUNDS;

  if (!Number.isInteger(maxRounds) || maxRounds < 1 || maxRounds > 50) {
    throw new Error("Max rounds must be between 1 and 50.");
  }

  return {
    status: "playing",
    currentPlayer: "X",
    lastWord: "",
    usedWords: [],
    history: [],
    scores: {
      X: 0,
      O: 0,
    },
    round: 1,
    maxRounds,
    winner: null,
  };
}

export function submitWord(state, word, options = {}) {
  if (!state || state.status !== "playing") {
    throw new Error("The game is not active.");
  }

  const validation = validateWord(word, state, options);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const player = state.currentPlayer;
  const score = calculateWordScore(validation.word);

  const entry = {
    player,
    word: validation.word,
    score,
    round: state.round,
  };

  const scores = {
    ...state.scores,
    [player]: state.scores[player] + score,
  };

  const nextPlayer = player === "X" ? "O" : "X";
  const isLastRound = state.round >= state.maxRounds;

  let winner = null;
  let status = "playing";

  if (isLastRound) {
    status = "finished";

    if (scores.X > scores.O) winner = "X";
    else if (scores.O > scores.X) winner = "O";
    else winner = "draw";
  }

  return {
    ...state,
    lastWord: validation.word,
    usedWords: [...state.usedWords, validation.word],
    history: [...state.history, entry],
    scores,
    round: state.round + 1,
    currentPlayer: nextPlayer,
    status,
    winner,
  };
}

export function getWordBattleResult(state) {
  if (!state || state.status !== "finished") return null;

  if (state.winner === "draw") {
    return "draw";
  }

  return state.winner;
}
