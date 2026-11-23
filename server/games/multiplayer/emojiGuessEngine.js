export const createInitialState = (players, puzzles) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 6) {
    throw new Error("Emoji Guess requires 2–6 players.");
  }

  if (!Array.isArray(puzzles) || puzzles.length === 0) {
    throw new Error("Emoji puzzles are required.");
  }

  return {
    gameId: "emoji-guess",
    players: players.map(String),
    puzzles: puzzles.map((puzzle) => ({
      emoji: puzzle.emoji,
      answer: String(puzzle.answer).trim().toLowerCase(),
      points: Number(puzzle.points) || 10,
    })),
    currentPuzzle: 0,
    attempts: [],
    scores: Object.fromEntries(players.map((id) => [String(id), 0])),
    status: "playing",
    winner: null,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") throw new Error("Game has ended.");
  if (!state.players.includes(id)) throw new Error("Not a player.");

  const answer = String(action.answer || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!answer || answer.length > 100) {
    throw new Error("Enter a valid answer.");
  }

  if (state.attempts.some((item) => item.userId === id)) {
    throw new Error("You have already attempted this puzzle.");
  }

  const puzzle = state.puzzles[state.currentPuzzle];
  const correct = answer === puzzle.answer;

  const next = structuredClone(state);

  next.attempts.push({
    userId: id,
    correct,
  });

  if (correct) {
    next.scores[id] += puzzle.points;
    next.status = "completed";
    next.winner = id;
  } else if (next.attempts.length >= next.players.length) {
    next.currentPuzzle += 1;
    next.attempts = [];

    if (next.currentPuzzle >= next.puzzles.length) {
      next.status = "completed";

      const highest = Math.max(...Object.values(next.scores));
      const winners = Object.keys(next.scores).filter(
        (playerId) => next.scores[playerId] === highest
      );

      next.winner = winners.length === 1 ? winners[0] : null;
    }
  }

  return next;
};

export const getPublicState = (state) => {
  const publicState = structuredClone(state);

  publicState.puzzles = state.puzzles.map((puzzle, index) => {
    if (index !== state.currentPuzzle || state.status === "completed") {
      return puzzle;
    }

    return {
      emoji: puzzle.emoji,
      points: puzzle.points,
    };
  });

  return publicState;
};

export const isFinished = (state) => state.status !== "playing";