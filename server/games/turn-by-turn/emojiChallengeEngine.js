export const createInitialState = (players, challenges) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 6) {
    throw new Error("Emoji Challenge requires 2–6 players.");
  }

  if (!Array.isArray(challenges) || challenges.length === 0) {
    throw new Error("Emoji challenges are required.");
  }

  const safeChallenges = challenges.map((challenge) => {
    if (!challenge.emoji || !challenge.answer) {
      throw new Error("Invalid emoji challenge.");
    }

    return {
      emoji: challenge.emoji,
      answer: String(challenge.answer)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " "),
      points: Math.max(1, Number(challenge.points) || 10),
      hint: challenge.hint || null,
    };
  });

  return {
    gameId: "emoji-challenge",
    players: players.map(String),
    challenges: safeChallenges,
    currentChallenge: 0,
    currentTurnIndex: 0,
    attempts: [],
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

  const challenge = state.challenges[state.currentChallenge];

  if (!challenge) {
    throw new Error("Challenge not found.");
  }

  const answer = String(action.answer || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (!answer || answer.length > 100) {
    throw new Error("Enter a valid answer.");
  }

  const next = structuredClone(state);

  const correct = answer === challenge.answer;

  next.attempts.push({
    userId: id,
    correct,
  });

  if (correct) {
    next.scores[id] += challenge.points;
    next.currentChallenge += 1;
    next.attempts = [];
    next.currentTurnIndex = 0;

    if (next.currentChallenge >= next.challenges.length) {
      next.status = "completed";

      const highest = Math.max(...Object.values(next.scores));

      const winners = Object.keys(next.scores).filter(
        (playerId) => next.scores[playerId] === highest
      );

      next.winner = winners.length === 1 ? winners[0] : null;
    }
  } else {
    const alreadyAttempted = new Set(
      next.attempts.map((attempt) => attempt.userId)
    );

    if (alreadyAttempted.size >= next.players.length) {
      next.currentChallenge += 1;
      next.attempts = [];
      next.currentTurnIndex = 0;

      if (next.currentChallenge >= next.challenges.length) {
        next.status = "completed";

        const highest = Math.max(...Object.values(next.scores));

        const winners = Object.keys(next.scores).filter(
          (playerId) => next.scores[playerId] === highest
        );

        next.winner = winners.length === 1 ? winners[0] : null;
      }
    } else {
      next.currentTurnIndex =
        (next.currentTurnIndex + 1) % next.players.length;
    }
  }

  return next;
};

export const getPublicState = (state) => {
  const publicState = structuredClone(state);

  publicState.challenges = state.challenges.map((challenge, index) => {
    if (
      index !== state.currentChallenge ||
      state.status === "completed"
    ) {
      return challenge;
    }

    return {
      emoji: challenge.emoji,
      points: challenge.points,
      hint: challenge.hint,
    };
  });

  return publicState;
};

export const isFinished = (state) => state.status !== "playing";