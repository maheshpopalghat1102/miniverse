export const createInitialState = (players, questions) => {
  if (!Array.isArray(players) || players.length !== 2) {
    throw new Error("Couple Quiz requires exactly 2 players.");
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Quiz questions are required.");
  }

  const safeQuestions = questions.map((question) => {
    if (
      !question.question ||
      !Array.isArray(question.options) ||
      question.options.length < 2 ||
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.options.length
    ) {
      throw new Error("Invalid quiz question.");
    }

    return {
      question: question.question,
      options: question.options,
      correctIndex: question.correctIndex,
      points: Number(question.points) || 10,
    };
  });

  return {
    gameId: "couple-quiz",
    players: players.map(String),
    questions: safeQuestions,
    currentQuestion: 0,
    answers: {},
    scores: Object.fromEntries(
      players.map((id) => [String(id), 0])
    ),
    matchedAnswers: 0,
    status: "playing",
    winner: null,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") {
    throw new Error("Game has ended.");
  }

  if (!state.players.includes(id)) {
    throw new Error("You are not part of this game.");
  }

  const question = state.questions[state.currentQuestion];

  if (!question) {
    throw new Error("Question not found.");
  }

  if (state.answers[id] !== undefined) {
    throw new Error("You have already answered this question.");
  }

  const optionIndex = Number(action.optionIndex);

  if (
    !Number.isInteger(optionIndex) ||
    optionIndex < 0 ||
    optionIndex >= question.options.length
  ) {
    throw new Error("Invalid answer.");
  }

  const next = structuredClone(state);

  next.answers[id] = optionIndex;

  const allAnswered = next.players.every(
    (playerId) => next.answers[playerId] !== undefined
  );

  if (allAnswered) {
    const [first, second] = next.players;

    if (next.answers[first] === next.answers[second]) {
      next.scores[first] += question.points;
      next.scores[second] += question.points;
      next.matchedAnswers += 1;
    }

    next.currentQuestion += 1;
    next.answers = {};

    if (next.currentQuestion >= next.questions.length) {
      next.status = "completed";

      if (next.scores[first] > next.scores[second]) {
        next.winner = first;
      } else if (next.scores[second] > next.scores[first]) {
        next.winner = second;
      } else {
        next.winner = null;
      }
    }
  }

  return next;
};

export const getPublicState = (state) => {
  const publicState = structuredClone(state);

  publicState.questions = state.questions.map((question, index) => {
    if (
      index !== state.currentQuestion ||
      state.status === "completed"
    ) {
      return question;
    }

    return {
      question: question.question,
      options: question.options,
      points: question.points,
    };
  });

  publicState.answers = Object.fromEntries(
    Object.keys(state.answers).map((id) => [id, "submitted"])
  );

  return publicState;
};

export const isFinished = (state) => state.status !== "playing";