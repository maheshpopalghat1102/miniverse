
export const DRAW_GUESS_CONFIG = {
  ROUND_DURATION: 80,
  POINTS_FOR_CORRECT_GUESS: 100,
  DRAWER_POINTS_PER_GUESS: 25,
  MAX_GUESSES_PER_PLAYER: 5,
  MAX_WORD_LENGTH: 30,
};

export const DRAW_GUESS_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  ROUND_COMPLETED: "round-completed",
  GAME_COMPLETED: "game-completed",
};

export const DRAW_GUESS_WORDS = {
  easy: [
    "Apple",
    "House",
    "Cat",
    "Dog",
    "Sun",
    "Tree",
    "Car",
    "Book",
    "Fish",
    "Ball",
    "Star",
    "Flower",
  ],
  medium: [
    "Airplane",
    "Rainbow",
    "Bicycle",
    "Guitar",
    "Waterfall",
    "Lighthouse",
    "Backpack",
    "Snowman",
    "Telescope",
    "Volcano",
  ],
  hard: [
    "Astronaut",
    "Microscope",
    "Helicopter",
    "Electricity",
    "Pyramid",
    "Chandelier",
    "Submarine",
    "Kaleidoscope",
  ],
};

export const normalizeGuess = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const validateGuess = (guess) => {
  const value = String(guess || "").trim();

  return (
    value.length >= 1 &&
    value.length <= DRAW_GUESS_CONFIG.MAX_WORD_LENGTH
  );
};

export const checkGuess = (guess, secretWord) => {
  return normalizeGuess(guess) === normalizeGuess(secretWord);
};

export const getRandomWord = (difficulty = "easy", usedWords = []) => {
  const words = DRAW_GUESS_WORDS[difficulty] || DRAW_GUESS_WORDS.easy;
  const used = new Set(usedWords.map(normalizeGuess));

  const available = words.filter(
    (word) => !used.has(normalizeGuess(word))
  );

  if (!available.length) {
    return null;
  }

  return available[Math.floor(Math.random() * available.length)];
};

export const getWordHint = (word) => {
  if (!word) return "";

  const characters = [...word];

  return characters
    .map((character, index) => {
      if (index === 0 || index === characters.length - 1) {
        return character;
      }

      return "_";
    })
    .join(" ");
};

export const getMaskedWord = (word, revealedIndexes = []) => {
  if (!word) return "";

  const revealed = new Set(revealedIndexes);

  return [...word]
    .map((character, index) => {
      if (character === " ") return " ";

      return revealed.has(index) ? character : "_";
    })
    .join(" ");
};

export const calculateGuesserPoints = (remainingSeconds) => {
  const timeBonus = Math.max(0, Math.floor(remainingSeconds));

  return (
    DRAW_GUESS_CONFIG.POINTS_FOR_CORRECT_GUESS +
    timeBonus
  );
};

export const calculateDrawerPoints = (correctGuessCount) => {
  return (
    Math.max(0, correctGuessCount) *
    DRAW_GUESS_CONFIG.DRAWER_POINTS_PER_GUESS
  );
};

export const normalizePlayers = (players = []) => {
  if (!Array.isArray(players)) return [];

  const seen = new Set();

  return players
    .map((player) => ({
      id: String(player.id || player._id || ""),
      name: String(player.name || player.username || "Player"),
      avatar: player.avatar || null,
      score: Number(player.score) || 0,
      isMe: Boolean(player.isMe),
    }))
    .filter((player) => {
      if (!player.id || seen.has(player.id)) return false;

      seen.add(player.id);
      return true;
    });
};

export const createInitialDrawGuessState = (players = []) => {
  const normalizedPlayers = normalizePlayers(players);

  return {
    players: normalizedPlayers,
    currentDrawerIndex: 0,
    currentDrawerId: normalizedPlayers[0]?.id || null,
    secretWord: null,
    difficulty: "easy",
    round: 1,
    totalRounds: normalizedPlayers.length,
    timeLeft: DRAW_GUESS_CONFIG.ROUND_DURATION,
    status: DRAW_GUESS_STATUS.WAITING,
    guesses: [],
    correctGuessers: [],
    usedWords: [],
    strokes: [],
    revealedIndexes: [],
  };
};

export const startDrawGuessRound = (
  state,
  secretWord,
  difficulty = "easy"
) => {
  if (!secretWord || typeof secretWord !== "string") {
    throw new Error("A valid secret word is required.");
  }

  return {
    ...state,
    secretWord,
    difficulty,
    timeLeft: DRAW_GUESS_CONFIG.ROUND_DURATION,
    guesses: [],
    correctGuessers: [],
    strokes: [],
    revealedIndexes: [],
    usedWords: [...state.usedWords, secretWord],
    status: DRAW_GUESS_STATUS.PLAYING,
  };
};

export const submitDrawGuess = (state, playerId, guess) => {
  if (state.status !== DRAW_GUESS_STATUS.PLAYING) {
    throw new Error("The round is not active.");
  }

  if (String(playerId) === String(state.currentDrawerId)) {
    throw new Error("The drawer cannot guess their own word.");
  }

  if (!validateGuess(guess)) {
    throw new Error("Please enter a valid guess.");
  }

  if (state.correctGuessers.includes(String(playerId))) {
    throw new Error("You have already guessed correctly.");
  }

  const previousGuess = state.guesses.find(
    (item) =>
      item.playerId === String(playerId) &&
      normalizeGuess(item.guess) === normalizeGuess(guess)
  );

  if (previousGuess) {
    throw new Error("You already submitted this guess.");
  }

  const isCorrect = checkGuess(guess, state.secretWord);

  const pointsEarned = isCorrect
    ? calculateGuesserPoints(state.timeLeft)
    : 0;

  const updatedPlayers = state.players.map((player) =>
    player.id === String(playerId)
      ? {
          ...player,
          score: player.score + pointsEarned,
        }
      : player
  );

  return {
    ...state,
    players: updatedPlayers,
    guesses: [
      ...state.guesses,
      {
        playerId: String(playerId),
        guess: String(guess).trim(),
        isCorrect,
        pointsEarned,
      },
    ],
    correctGuessers: isCorrect
      ? [...state.correctGuessers, String(playerId)]
      : state.correctGuessers,
  };
};

export const addDrawerPoints = (state) => {
  const points = calculateDrawerPoints(
    state.correctGuessers.length
  );

  return {
    ...state,
    players: state.players.map((player) =>
      player.id === state.currentDrawerId
        ? {
            ...player,
            score: player.score + points,
          }
        : player
    ),
  };
};

export const advanceDrawGuessRound = (state) => {
  if (!state.players.length) {
    return {
      ...state,
      status: DRAW_GUESS_STATUS.GAME_COMPLETED,
    };
  }

  const updatedState = addDrawerPoints(state);

  const nextDrawerIndex =
    (state.currentDrawerIndex + 1) % state.players.length;

  const nextRound = state.round + 1;

  if (nextRound > state.totalRounds) {
    return {
      ...updatedState,
      status: DRAW_GUESS_STATUS.GAME_COMPLETED,
      secretWord: null,
      strokes: [],
    };
  }

  return {
    ...updatedState,
    currentDrawerIndex: nextDrawerIndex,
    currentDrawerId: state.players[nextDrawerIndex].id,
    round: nextRound,
    secretWord: null,
    timeLeft: DRAW_GUESS_CONFIG.ROUND_DURATION,
    guesses: [],
    correctGuessers: [],
    strokes: [],
    revealedIndexes: [],
    status: DRAW_GUESS_STATUS.ROUND_COMPLETED,
  };
};

export const getDrawGuessWinner = (players = []) => {
  if (!players.length) return null;

  const highestScore = Math.max(
    ...players.map((player) => player.score)
  );

  const winners = players.filter(
    (player) => player.score === highestScore
  );

  return {
    players: winners,
    score: highestScore,
    isDraw: winners.length > 1,
  };
};
