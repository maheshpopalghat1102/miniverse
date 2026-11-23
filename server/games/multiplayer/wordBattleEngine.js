export const createInitialState = (players, options = {}) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 6) {
    throw new Error("Word Battle requires 2–6 players.");
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter = options.letter ||
    letters[Math.floor(Math.random() * letters.length)];

  return {
    gameId: "word-battle",
    players: players.map(String),
    category: options.category || "Animals",
    letter,
    currentTurn: String(players[0]),
    answers: [],
    usedWords: [],
    maxRounds: Math.max(1, Number(options.maxRounds) || 5),
    currentRound: 1,
    scores: Object.fromEntries(players.map((id) => [String(id), 0])),
    status: "playing",
    winner: null,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") throw new Error("Game has ended.");
  if (state.currentTurn !== id) throw new Error("Not your turn.");

  const word = String(action.word || "").trim().toLowerCase();

  if (!/^[a-z]{2,30}$/.test(word)) throw new Error("Invalid word.");
  if (!word.toUpperCase().startsWith(state.letter)) {
    throw new Error(`Your word must start with ${state.letter}.`);
  }
  if (state.usedWords.includes(word)) throw new Error("Word already used.");

  const next = structuredClone(state);

  // Basic validation only; add trusted dictionary/category verification.
  const valid = action.dictionaryVerified === true;

  if (!valid) {
    throw new Error("Word has not been verified by the server dictionary.");
  }

  next.answers.push({ userId: id, word });
  next.usedWords.push(word);
  next.scores[id] += word.length;

  const currentIndex = next.players.indexOf(id);

  if (currentIndex === next.players.length - 1) {
    next.currentRound += 1;

    if (next.currentRound > next.maxRounds) {
      next.status = "completed";
      const highest = Math.max(...Object.values(next.scores));
      const winners = Object.keys(next.scores).filter(
        (playerId) => next.scores[playerId] === highest
      );
      next.winner = winners.length === 1 ? winners[0] : null;
    } else {
      next.currentTurn = next.players[0];
    }
  } else {
    next.currentTurn = next.players[currentIndex + 1];
  }

  return next;
};

export const getPublicState = (state) => structuredClone(state);

export const isFinished = (state) => state.status !== "playing";