
export const COUPLE_QUIZ_CONFIG = {
  TOTAL_QUESTIONS: 10,
  QUESTION_TIME: 30,
  POINTS_CORRECT: 100,
};

export const COUPLE_QUIZ_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  QUESTION_RESULT: "question-result",
  FINISHED: "finished",
};

export const SAMPLE_COUPLE_QUESTIONS = [
  {
    questionId: "couple-001",
    category: "Getting to Know Each Other",
    question: "What is the best way to spend a relaxing weekend?",
    options: [
      "Watching movies at home",
      "Going on an adventure",
      "Trying new food",
      "Spending time outdoors",
    ],
    correctAnswer: 0,
    explanation: "There is no wrong personal preference!",
  },
  {
    questionId: "couple-002",
    category: "Favorites",
    question: "Which type of holiday sounds most exciting?",
    options: [
      "Beach vacation",
      "Mountain trip",
      "City exploration",
      "Road trip",
    ],
    correctAnswer: 1,
    explanation: "Everyone has their own perfect holiday.",
  },
  {
    questionId: "couple-003",
    category: "Fun Questions",
    question: "If you could learn one new skill instantly, what would it be?",
    options: [
      "Playing an instrument",
      "Speaking a new language",
      "Cooking like a chef",
      "Professional photography",
    ],
    correctAnswer: 1,
    explanation: "Learning a language opens up new worlds.",
  },
  {
    questionId: "couple-004",
    category: "Personality",
    question: "Which quality is most important in a friendship?",
    options: [
      "Trust",
      "Humor",
      "Honesty",
      "Adventure",
    ],
    correctAnswer: 0,
    explanation: "Trust helps relationships grow.",
  },
  {
    questionId: "couple-005",
    category: "Dreams",
    question: "Which dream destination would you choose?",
    options: [
      "Japan",
      "Switzerland",
      "Italy",
      "New Zealand",
    ],
    correctAnswer: 0,
    explanation: "Every destination has something special.",
  },
  {
    questionId: "couple-006",
    category: "Daily Life",
    question: "Which activity helps you relax the most?",
    options: [
      "Listening to music",
      "Reading",
      "Playing games",
      "Going for a walk",
    ],
    correctAnswer: 0,
    explanation: "Music can be a great way to unwind.",
  },
  {
    questionId: "couple-007",
    category: "Fun Questions",
    question: "Which superpower would you choose?",
    options: [
      "Teleportation",
      "Flying",
      "Time travel",
      "Invisibility",
    ],
    correctAnswer: 0,
    explanation: "Teleportation would make travel instant!",
  },
  {
    questionId: "couple-008",
    category: "Favorites",
    question: "Which food would you happily eat again and again?",
    options: [
      "Pizza",
      "Pasta",
      "Biryani",
      "Desserts",
    ],
    correctAnswer: 2,
    explanation: "Food preferences are personal.",
  },
  {
    questionId: "couple-009",
    category: "Dreams",
    question: "What would make a perfect day?",
    options: [
      "Exploring somewhere new",
      "Spending time with loved ones",
      "Achieving a big goal",
      "Relaxing without plans",
    ],
    correctAnswer: 1,
    explanation: "Meaningful time with loved ones is special.",
  },
  {
    questionId: "couple-010",
    category: "Personality",
    question: "When facing a challenge, what is your first instinct?",
    options: [
      "Make a plan",
      "Ask for advice",
      "Try immediately",
      "Take time to think",
    ],
    correctAnswer: 0,
    explanation: "Planning is one way to approach a challenge.",
  },
];

export function shuffleCoupleQuestions(questions = []) {
  const result = [...questions];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function normalizeCouplePlayers(players = []) {
  return players.map((player, index) => ({
    id: String(player.id || player._id || `player-${index + 1}`),
    name: player.name || player.username || `Player ${index + 1}`,
    avatar: player.avatar || "",
    score: Number(player.score || 0),
    isMe: Boolean(player.isMe),
  }));
}

export function createInitialCoupleQuizState({
  players = [],
  questions = SAMPLE_COUPLE_QUESTIONS,
  totalQuestions = COUPLE_QUIZ_CONFIG.TOTAL_QUESTIONS,
} = {}) {
  const normalizedPlayers = normalizeCouplePlayers(players);

  return {
    status: COUPLE_QUIZ_STATUS.WAITING,
    players: normalizedPlayers.slice(0, 2),
    questions: questions.slice(0, totalQuestions),
    currentQuestionIndex: 0,
    currentQuestion: null,
    currentTurnIndex: 0,
    answers: {},
    questionResults: [],
    totalQuestions: Math.min(totalQuestions, questions.length),
    winner: null,
    isDraw: false,
  };
}

export function startCoupleQuiz(state) {
  if (state.players.length !== 2 || !state.questions.length) {
    return state;
  }

  return {
    ...state,
    status: COUPLE_QUIZ_STATUS.PLAYING,
    currentQuestionIndex: 0,
    currentQuestion: state.questions[0],
    currentTurnIndex: 0,
    answers: {},
  };
}

export function getCurrentCouplePlayer(state) {
  return state.players[state.currentTurnIndex] || null;
}

export function submitCoupleAnswer(state, playerId, answerIndex) {
  if (state.status !== COUPLE_QUIZ_STATUS.PLAYING) {
    return { state, error: "The quiz is not accepting answers." };
  }

  const player = getCurrentCouplePlayer(state);

  if (!player || player.id !== String(playerId)) {
    return { state, error: "It is not your turn." };
  }

  if (state.answers[player.id] !== undefined) {
    return { state, error: "You have already answered." };
  }

  const question = state.currentQuestion;

  if (
    !Number.isInteger(answerIndex) ||
    answerIndex < 0 ||
    answerIndex >= question.options.length
  ) {
    return { state, error: "Please select a valid option." };
  }

  const isCorrect = answerIndex === question.correctAnswer;
  const points = isCorrect
    ? COUPLE_QUIZ_CONFIG.POINTS_CORRECT
    : 0;

  const nextAnswers = {
    ...state.answers,
    [player.id]: {
      playerId: player.id,
      answerIndex,
      isCorrect,
      points,
    },
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
      currentTurnIndex: allAnswered
        ? state.currentTurnIndex
        : (state.currentTurnIndex + 1) % 2,
      status: allAnswered
        ? COUPLE_QUIZ_STATUS.QUESTION_RESULT
        : COUPLE_QUIZ_STATUS.PLAYING,
    },
    error: null,
  };
}

export function advanceCoupleQuestion(state) {
  const nextIndex = state.currentQuestionIndex + 1;

  if (nextIndex >= state.totalQuestions) {
    return finishCoupleQuiz(state);
  }

  return {
    ...state,
    status: COUPLE_QUIZ_STATUS.PLAYING,
    currentQuestionIndex: nextIndex,
    currentQuestion: state.questions[nextIndex],
    currentTurnIndex: 0,
    answers: {},
  };
}

export function finishCoupleQuiz(state) {
  const [first, second] = state.players;

  const winner =
    first.score === second.score
      ? null
      : first.score > second.score
        ? first
        : second;

  return {
    ...state,
    status: COUPLE_QUIZ_STATUS.FINISHED,
    winner,
    isDraw: !winner,
  };
}

export function getCoupleQuizLeaderboard(players = []) {
  return [...players]
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
}
