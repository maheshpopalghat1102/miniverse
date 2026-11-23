
export const GUESS_PICTURE_CONFIG = {
  POINTS_PER_CORRECT_ANSWER: 10,
  HINT_PENALTY: 2,
  MAX_HINTS: 1,
};

export const GUESS_PICTURE_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  ANSWERED: "answered",
  COMPLETED: "completed",
};

export const SAMPLE_PICTURE_QUESTIONS = [
  {
    questionId: "picture-001",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800",
    category: "Animals",
    difficulty: "easy",
    question: "Which animal is shown in this picture?",
    options: ["Dog", "Cat", "Lion", "Fox"],
    correctAnswer: "Dog",
    hint: "It is commonly kept as a pet.",
    points: 10,
  },
  {
    questionId: "picture-002",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
    category: "Nature",
    difficulty: "easy",
    question: "What type of place is shown?",
    options: ["Desert", "Mountain landscape", "City", "Beach"],
    correctAnswer: "Mountain landscape",
    hint: "Look at the tall natural formations.",
    points: 10,
  },
  {
    questionId: "picture-003",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
    category: "Food & Places",
    difficulty: "medium",
    question: "What kind of place is this?",
    options: ["Restaurant", "Library", "Hospital", "School"],
    correctAnswer: "Restaurant",
    hint: "People visit this place to eat.",
    points: 15,
  },
  {
    questionId: "picture-004",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    category: "Technology",
    difficulty: "medium",
    question: "Which technology-related object is shown?",
    options: ["Circuit board", "Camera", "Keyboard", "Headphones"],
    correctAnswer: "Circuit board",
    hint: "It contains electronic components.",
    points: 15,
  },
];

export const validatePictureQuestion = (question) => {
  if (!question || typeof question !== "object") {
    return false;
  }

  return (
    typeof question.questionId === "string" &&
    question.questionId.trim().length > 0 &&
    typeof question.imageUrl === "string" &&
    /^https?:\/\//i.test(question.imageUrl) &&
    typeof question.question === "string" &&
    question.question.trim().length > 0 &&
    Array.isArray(question.options) &&
    question.options.length >= 2 &&
    question.options.every(
      (option) => typeof option === "string" && option.trim().length > 0
    ) &&
    typeof question.correctAnswer === "string" &&
    question.options.includes(question.correctAnswer)
  );
};

export const normalizePictureAnswer = (answer) =>
  String(answer || "").trim().toLowerCase();

export const checkPictureAnswer = (question, answer) => {
  if (!validatePictureQuestion(question)) {
    return false;
  }

  return (
    normalizePictureAnswer(answer) ===
    normalizePictureAnswer(question.correctAnswer)
  );
};

export const createInitialPictureGameState = (players = []) => {
  const normalizedPlayers = Array.isArray(players)
    ? players
        .map((player) => ({
          id: String(player.id || player._id || ""),
          name: String(player.name || player.username || "Player"),
          avatar: player.avatar || null,
          score: 0,
          isMe: Boolean(player.isMe),
        }))
        .filter((player) => player.id)
    : [];

  return {
    players: normalizedPlayers,
    currentPlayerIndex: 0,
    currentPlayerId: normalizedPlayers[0]?.id || null,
    currentQuestion: null,
    questionIndex: 0,
    totalQuestions: 0,
    answeredQuestions: [],
    usedQuestionIds: [],
    selectedAnswer: null,
    isCorrect: null,
    hintUsed: false,
    pointsEarned: 0,
    status: GUESS_PICTURE_STATUS.WAITING,
  };
};

export const startPictureGame = (state, totalQuestions) => ({
  ...state,
  totalQuestions,
  questionIndex: 0,
  currentQuestion: null,
  selectedAnswer: null,
  isCorrect: null,
  hintUsed: false,
  pointsEarned: 0,
  usedQuestionIds: [],
  answeredQuestions: [],
  status: GUESS_PICTURE_STATUS.PLAYING,
});

export const setPictureQuestion = (state, question) => {
  if (!validatePictureQuestion(question)) {
    throw new Error("Invalid picture question.");
  }

  if (state.usedQuestionIds.includes(question.questionId)) {
    throw new Error("This picture question has already been used.");
  }

  return {
    ...state,
    currentQuestion: question,
    selectedAnswer: null,
    isCorrect: null,
    hintUsed: false,
    pointsEarned: 0,
    status: GUESS_PICTURE_STATUS.PLAYING,
  };
};

export const usePictureHint = (state) => {
  if (!state.currentQuestion) {
    throw new Error("No active question.");
  }

  if (state.hintUsed) {
    throw new Error("Hint has already been used.");
  }

  return {
    ...state,
    hintUsed: true,
  };
};

export const submitPictureAnswer = (state, answer) => {
  if (state.status !== GUESS_PICTURE_STATUS.PLAYING) {
    throw new Error("This question is not accepting answers.");
  }

  if (!state.currentQuestion) {
    throw new Error("No active question.");
  }

  if (!answer || !state.currentQuestion.options.includes(answer)) {
    throw new Error("Please select a valid answer.");
  }

  const isCorrect = checkPictureAnswer(
    state.currentQuestion,
    answer
  );

  const basePoints =
    state.currentQuestion.points ||
    GUESS_PICTURE_CONFIG.POINTS_PER_CORRECT_ANSWER;

  const hintPenalty = state.hintUsed
    ? GUESS_PICTURE_CONFIG.HINT_PENALTY
    : 0;

  const pointsEarned = isCorrect
    ? Math.max(0, basePoints - hintPenalty)
    : 0;

  const updatedPlayers = state.players.map((player) =>
    player.id === state.currentPlayerId
      ? {
          ...player,
          score: player.score + pointsEarned,
        }
      : player
  );

  return {
    ...state,
    players: updatedPlayers,
    selectedAnswer: answer,
    isCorrect,
    pointsEarned,
    answeredQuestions: [
      ...state.answeredQuestions,
      {
        questionId: state.currentQuestion.questionId,
        playerId: state.currentPlayerId,
        answer,
        isCorrect,
        pointsEarned,
        hintUsed: state.hintUsed,
      },
    ],
    usedQuestionIds: [
      ...state.usedQuestionIds,
      state.currentQuestion.questionId,
    ],
    status: GUESS_PICTURE_STATUS.ANSWERED,
  };
};

export const advancePictureGame = (state, nextQuestion) => {
  const nextQuestionIndex = state.questionIndex + 1;

  if (nextQuestionIndex >= state.totalQuestions) {
    return {
      ...state,
      currentQuestion: null,
      status: GUESS_PICTURE_STATUS.COMPLETED,
    };
  }

  const nextState = {
    ...state,
    questionIndex: nextQuestionIndex,
    currentPlayerIndex:
      state.players.length > 1
        ? (state.currentPlayerIndex + 1) % state.players.length
        : 0,
    currentPlayerId:
      state.players.length > 1
        ? state.players[
            (state.currentPlayerIndex + 1) % state.players.length
          ].id
        : state.players[0]?.id || null,
  };

  if (nextQuestion) {
    return setPictureQuestion(nextState, nextQuestion);
  }

  return {
    ...nextState,
    currentQuestion: null,
    status: GUESS_PICTURE_STATUS.PLAYING,
  };
};

export const getRandomPictureQuestion = (
  questions = [],
  usedQuestionIds = []
) => {
  const used = new Set(usedQuestionIds);

  const available = questions.filter(
    (question) =>
      validatePictureQuestion(question) &&
      !used.has(question.questionId)
  );

  if (!available.length) {
    return null;
  }

  return available[Math.floor(Math.random() * available.length)];
};

export const getPictureGameWinner = (players = []) => {
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
