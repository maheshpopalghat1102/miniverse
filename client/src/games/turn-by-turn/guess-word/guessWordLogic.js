
export const GUESS_WORD_CONFIG = {
  TOTAL_ROUNDS: 10,
  POINTS_CORRECT: 100,
  MAX_HINTS: 2,
};

export const GUESS_WORD_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  ROUND_RESULT: "round-result",
  FINISHED: "finished",
};

export const SAMPLE_WORDS = [
  {
    wordId: "word-001",
    word: "APPLE",
    hint: "A fruit that can be red or green.",
    category: "Food",
    difficulty: "easy",
    extraHints: ["Often used in pies.", "It grows on a tree."],
  },
  {
    wordId: "word-002",
    word: "ELEPHANT",
    hint: "A very large animal with a trunk.",
    category: "Animals",
    difficulty: "easy",
    extraHints: ["It has large ears.", "It is known for its memory."],
  },
  {
    wordId: "word-003",
    word: "RAINBOW",
    hint: "A colorful arc that may appear after rain.",
    category: "Nature",
    difficulty: "easy",
    extraHints: ["It can have seven colors.", "It appears in the sky."],
  },
  {
    wordId: "word-004",
    word: "KEYBOARD",
    hint: "A device used to type on a computer.",
    category: "Technology",
    difficulty: "medium",
    extraHints: ["It has many keys.", "You use it with a computer."],
  },
  {
    wordId: "word-005",
    word: "BUTTERFLY",
    hint: "An insect with colorful wings.",
    category: "Animals",
    difficulty: "medium",
    extraHints: ["It starts life as a caterpillar.", "It visits flowers."],
  },
  {
    wordId: "word-006",
    word: "MOUNTAIN",
    hint: "A very high natural landform.",
    category: "Nature",
    difficulty: "medium",
    extraHints: ["Some have snow on top.", "People climb it."],
  },
  {
    wordId: "word-007",
    word: "ASTRONAUT",
    hint: "A person trained to travel into space.",
    category: "Science",
    difficulty: "hard",
    extraHints: ["They may work on a space station.", "They wear a spacesuit."],
  },
  {
    wordId: "word-008",
    word: "PHOTOGRAPHY",
    hint: "The art of capturing images using a camera.",
    category: "Art",
    difficulty: "hard",
    extraHints: ["It involves lenses.", "It can capture memories."],
  },
  {
    wordId: "word-009",
    word: "CHOCOLATE",
    hint: "A sweet treat made from cocoa.",
    category: "Food",
    difficulty: "easy",
    extraHints: ["It can be dark or white.", "It is used in desserts."],
  },
  {
    wordId: "word-010",
    word: "TELESCOPE",
    hint: "An instrument used to observe distant objects.",
    category: "Science",
    difficulty: "hard",
    extraHints: ["Astronomers use it.", "It helps observe stars and planets."],
  },
];

export function normalizeWord(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function validateWordEntry(entry) {
  return Boolean(
    entry &&
      entry.wordId &&
      typeof entry.word === "string" &&
      typeof entry.hint === "string" &&
      normalizeWord(entry.word).length > 0
  );
}

export function normalizeGuessPlayers(players = []) {
  return players.map((player, index) => ({
    id: String(player.id || player._id || `player-${index + 1}`),
    name: player.name || player.username || `Player ${index + 1}`,
    score: Number(player.score || 0),
    isMe: Boolean(player.isMe),
  }));
}

export function shuffleWordEntries(words = []) {
  const result = [...words];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function createInitialGuessWordState({
  players = [],
  words = SAMPLE_WORDS,
  totalRounds = GUESS_WORD_CONFIG.TOTAL_ROUNDS,
} = {}) {
  const validWords = words.filter(validateWordEntry);

  return {
    status: GUESS_WORD_STATUS.WAITING,
    players: normalizeGuessPlayers(players).slice(0, 2),
    words: validWords.slice(0, totalRounds),
    currentRoundIndex: 0,
    currentWord: null,
    currentTurnIndex: 0,
    hintsUsed: 0,
    answers: {},
    roundResults: [],
    totalRounds: Math.min(totalRounds, validWords.length),
    winner: null,
    isDraw: false,
  };
}

export function startGuessWordGame(state) {
  if (state.players.length !== 2 || !state.words.length) {
    return state;
  }

  return {
    ...state,
    status: GUESS_WORD_STATUS.PLAYING,
    currentRoundIndex: 0,
    currentWord: state.words[0],
    currentTurnIndex: 0,
    hintsUsed: 0,
    answers: {},
  };
}

export function getCurrentGuessPlayer(state) {
  return state.players[state.currentTurnIndex] || null;
}

export function revealWordHint(state) {
  if (state.status !== GUESS_WORD_STATUS.PLAYING) return state;

  if (state.hintsUsed >= GUESS_WORD_CONFIG.MAX_HINTS) {
    return state;
  }

  return {
    ...state,
    hintsUsed: state.hintsUsed + 1,
  };
}

export function getVisibleWordHints(state) {
  const hints = state.currentWord?.extraHints || [];

  return hints.slice(0, state.hintsUsed);
}

export function submitWordGuess(state, playerId, guess) {
  if (state.status !== GUESS_WORD_STATUS.PLAYING) {
    return { state, error: "The game is not accepting guesses." };
  }

  const player = getCurrentGuessPlayer(state);

  if (!player || player.id !== String(playerId)) {
    return { state, error: "It is not your turn." };
  }

  if (state.answers[player.id] !== undefined) {
    return { state, error: "You have already guessed this round." };
  }

  const normalizedGuess = normalizeWord(guess);

  if (!normalizedGuess) {
    return { state, error: "Enter a word first." };
  }

  const correctWord = normalizeWord(state.currentWord.word);
  const isCorrect = normalizedGuess === correctWord;

  const points = isCorrect
    ? Math.max(
        25,
        GUESS_WORD_CONFIG.POINTS_CORRECT -
          state.hintsUsed * 25
      )
    : 0;

  const answer = {
    playerId: player.id,
    guess: normalizedGuess,
    isCorrect,
    points,
  };

  const nextAnswers = {
    ...state.answers,
    [player.id]: answer,
  };

  const nextPlayers = state.players.map((item) =>
    item.id === player.id
      ? { ...item, score: item.score + points }
      : item
  );

  const allAnswered = nextPlayers.every(
    (item) => nextAnswers[item.id] !== undefined
  );

  return {
    state: {
      ...state,
      players: nextPlayers,
      answers: nextAnswers,
      status: allAnswered
        ? GUESS_WORD_STATUS.ROUND_RESULT
        : GUESS_WORD_STATUS.PLAYING,
      currentTurnIndex: allAnswered
        ? state.currentTurnIndex
        : (state.currentTurnIndex + 1) % 2,
    },
    answer,
    error: null,
  };
}

export function advanceGuessWordRound(state) {
  const nextIndex = state.currentRoundIndex + 1;

  if (nextIndex >= state.totalRounds) {
    return finishGuessWordGame(state);
  }

  return {
    ...state,
    status: GUESS_WORD_STATUS.PLAYING,
    currentRoundIndex: nextIndex,
    currentWord: state.words[nextIndex],
    currentTurnIndex: 0,
    hintsUsed: 0,
    answers: {},
  };
}

export function finishGuessWordGame(state) {
  const [first, second] = state.players;

  const winner =
    first.score === second.score
      ? null
      : first.score > second.score
        ? first
        : second;

  return {
    ...state,
    status: GUESS_WORD_STATUS.FINISHED,
    winner,
    isDraw: !winner,
  };
}

export function getGuessWordLeaderboard(players = []) {
  return [...players]
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
}
