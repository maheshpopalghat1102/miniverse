export const createInitialState = (players, pictures) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 6) {
    throw new Error("Guess Picture requires 2–6 players.");
  }

  if (!Array.isArray(pictures) || pictures.length === 0) {
    throw new Error("Picture questions are required.");
  }

  return {
    gameId: "guess-picture",
    players: players.map(String),
    pictures: pictures.map((picture) => ({
      imageId: String(picture.imageId),
      imageUrl: picture.imageUrl,
      answer: String(picture.answer).trim().toLowerCase(),
      points: Number(picture.points) || 10,
    })),
    currentPicture: 0,
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

  if (state.attempts.some((attempt) => attempt.userId === id)) {
    throw new Error("You have already attempted this picture.");
  }

  const picture = state.pictures[state.currentPicture];
  const correct = answer === picture.answer;

  const next = structuredClone(state);

  next.attempts.push({ userId: id, correct });

  if (correct) {
    next.scores[id] += picture.points;
    next.status = "completed";
    next.winner = id;
  } else if (next.attempts.length >= next.players.length) {
    next.currentPicture += 1;
    next.attempts = [];

    if (next.currentPicture >= next.pictures.length) {
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

  publicState.pictures = state.pictures.map((picture, index) => {
    if (index !== state.currentPicture || state.status === "completed") {
      return picture;
    }

    return {
      imageId: picture.imageId,
      imageUrl: picture.imageUrl,
      points: picture.points,
    };
  });

  return publicState;
};

export const isFinished = (state) => state.status !== "playing";