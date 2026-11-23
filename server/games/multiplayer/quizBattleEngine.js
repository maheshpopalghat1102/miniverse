export const createInitialState = (players, questions) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 6) {
    throw new Error("Quiz Battle requires 2–6 players.");
  }

  if (!Array.isArray(questions) || questions.length < 1) {
    throw new Error("Quiz questions are required.");
  }

  const safeQuestions = questions.map((q) => {
    if (
      !q.question ||
      !Array.isArray(q.options) ||
      q.options.length < 2 ||
      !Number.isInteger(q.correctIndex) ||
      q.correctIndex < 0 ||
      q.correctIndex >= q.options.length
    ) {
      throw new Error("Invalid quiz question data.");
    }

    return {
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      points: Number(q.points) || 10,
    };
  });

  return {
    gameId: "quiz-battle",
    players: players.map(String),
    questions: safeQuestions,
    currentQuestion: 0,
    answers: {},
    scores: Object.fromEntries(players.map((id) => [String(id), 0])),
    status: "playing",
    winner: null,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") throw new Error("Quiz has ended.");
  if (!state.players.includes(id)) throw new Error("Not a player.");

  const question = state.questions[state.currentQuestion];

  if (state.answers[id] !== undefined) {
    throw new Error("You already answered this question.");
  }

  const selectedIndex = Number(action.optionIndex);

  if (
    !Number.isInteger(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex >= question.options.length
  ) {
    throw new Error("Invalid answer option.");
  }

  const next = structuredClone(state);

  next.answers[id] = {
    selectedIndex,
    correct: selectedIndex === question.correctIndex,
  };

  const allAnswered = next.players.every(
    (playerId) => next.answers[playerId] !== undefined
  );

  if (allAnswered) {
    for (const playerId of next.players) {
      if (next.answers[playerId].correct) {
        next.scores[playerId] += question.points;
      }
    }

    next.currentQuestion += 1;
    next.answers = {};

    if (next.currentQuestion >= next.questions.length) {
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

  publicState.questions = state.questions.map((question, index) => {
    if (index !== state.currentQuestion || state.status === "completed") {
      return question;
    }

    return {
      question: question.question,
      options: question.options,
      points: question.points,
    };
  });

  return publicState;
};

export const isFinished = (state) => state.status !== "playing";