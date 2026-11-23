
export const NUMBER_BATTLE_CONFIG = {
  QUESTION_TIME: 20,
  TOTAL_ROUNDS: 10,
  POINTS_CORRECT: 100,
  SPEED_BONUS_MAX: 50,
  MAX_PLAYERS: 4,
};

export const NUMBER_BATTLE_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  ROUND_RESULT: "round-result",
  FINISHED: "finished",
};

export const SAMPLE_NUMBER_QUESTIONS = [
  {
    questionId: "num-001",
    question: "What is 25 + 37?",
    options: ["52", "62", "72", "57"],
    correctAnswer: "62",
    difficulty: "easy",
    explanation: "25 + 37 = 62.",
  },
  {
    questionId: "num-002",
    question: "What is 12 × 8?",
    options: ["86", "94", "96", "108"],
    correctAnswer: "96",
    difficulty: "easy",
    explanation: "12 multiplied by 8 equals 96.",
  },
  {
    questionId: "num-003",
    question: "What is 144 ÷ 12?",
    options: ["10", "11", "12", "14"],
    correctAnswer: "12",
    difficulty: "easy",
    explanation: "144 divided by 12 equals 12.",
  },
  {
    questionId: "num-004",
    question: "What is 15% of 200?",
    options: ["20", "25", "30", "35"],
    correctAnswer: "30",
    difficulty: "medium",
    explanation: "15% of 200 = 0.15 × 200 = 30.",
  },
  {
    questionId: "num-005",
    question: "What is the square of 17?",
    options: ["279", "289", "299", "309"],
    correctAnswer: "289",
    difficulty: "medium",
    explanation: "17 × 17 = 289.",
  },
  {
    questionId: "num-006",
    question: "What is 3³ + 4²?",
    options: ["39", "41", "43", "45"],
    correctAnswer: "43",
    difficulty: "medium",
    explanation: "3³ = 27 and 4² = 16. Total = 43.",
  },
  {
    questionId: "num-007",
    question: "What is the next number: 2, 6, 12, 20, 30, ?",
    options: ["36", "40", "42", "44"],
    correctAnswer: "42",
    difficulty: "hard",
    explanation: "The differences are 4, 6, 8, 10, then 12. So 30 + 12 = 42.",
  },
  {
    questionId: "num-008",
    question: "If x + 7 = 19, what is 3x?",
    options: ["30", "33", "36", "39"],
    correctAnswer: "36",
    difficulty: "hard",
    explanation: "x = 12, so 3x = 36.",
  },
  {
    questionId: "num-009",
    question: "What is the LCM of 8 and 12?",
    options: ["16", "20", "24", "32"],
    correctAnswer: "24",
    difficulty: "medium",
    explanation: "24 is the smallest number divisible by both 8 and 12.",
  },
  {
    questionId: "num-010",
    question: "A number is increased by 20% to become 120. What was the original number?",
    options: ["90", "96", "100", "110"],
    correctAnswer: "100",
    difficulty: "hard",
    explanation: "120 ÷ 1.2 = 100.",
  },
];

export function normalizeNumberAnswer(answer) {
  return String(answer ?? "").trim().replace(/,/g, "");
}

export function validateNumberQuestion(question) {
  return Boolean(
    question &&
      question.questionId &&
      typeof question.question === "string" &&
      Array.isArray(question.options) &&
      question.options.length >= 2 &&
      question.correctAnswer !== undefined
  );
}

export function normalizeNumberPlayers(players = []) {
  return players.map((player, index) => ({
    id: String(player.id || player._id || `player-${index + 1}`),
    name: player.name || player.username || `Player ${index + 1}`,
    avatar: player.avatar || "",
    score: Number(player.score || 0),
    isMe: Boolean(player.isMe),
    hasAnswered: Boolean(player.hasAnswered),
    answer: player.answer ?? null,
    isCorrect: Boolean(player.isCorrect),
  }));
}

export function shuffleNumberQuestions(questions = []) {
  const shuffled = [...questions];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function createInitialNumberBattleState({
  players = [],
  questions = SAMPLE_NUMBER_QUESTIONS,
  totalRounds = NUMBER_BATTLE_CONFIG.TOTAL_ROUNDS,
} = {}) {
  const normalizedPlayers = normalizeNumberPlayers(players);
  const validQuestions = questions.filter(validateNumberQuestion);

  return {
    status: NUMBER_BATTLE_STATUS.WAITING,
    players: normalizedPlayers,
    questions: validQuestions,
    currentQuestionIndex: 0,
    totalRounds: Math.min(totalRounds, validQuestions.length),
    currentQuestion: null,
    answers: {},
    roundResults: [],
    winner: null,
    isDraw: false,
    startedAt: null,
    finishedAt: null,
  };
}

export function startNumberBattle(state) {
  if (!state.players.length || !state.questions.length) {
    return state;
  }

  const firstQuestion = state.questions[0];

  return {
    ...state,
    status: NUMBER_BATTLE_STATUS.PLAYING,
    currentQuestionIndex: 0,
    currentQuestion: firstQuestion,
    answers: {},
    startedAt: Date.now(),
    winner: null,
    isDraw: false,
  };
}

export function getCurrentNumberQuestion(state) {
  return state.currentQuestion || null;
}

export function hasPlayerAnswered(state, playerId) {
  return Boolean(state.answers?.[playerId]);
}

export function allNumberPlayersAnswered(state) {
  if (!state.players.length) return false;

  return state.players.every((player) =>
    hasPlayerAnswered(state, player.id)
  );
}

export function calculateNumberPoints({
  isCorrect,
  elapsedSeconds = 0,
  questionTime = NUMBER_BATTLE_CONFIG.QUESTION_TIME,
}) {
  if (!isCorrect) return 0;

  const remaining = Math.max(
    0,
    questionTime - Math.max(0, elapsedSeconds)
  );

  const speedBonus = Math.round(
    (remaining / questionTime) *
      NUMBER_BATTLE_CONFIG.SPEED_BONUS_MAX
  );

  return NUMBER_BATTLE_CONFIG.POINTS_CORRECT + speedBonus;
}

export function submitNumberAnswer(
  state,
  { playerId, answer, elapsedSeconds = 0 } = {}
) {
  if (state.status !== NUMBER_BATTLE_STATUS.PLAYING) {
    return { state, error: "The round is not accepting answers." };
  }

  const player = state.players.find(
    (item) => item.id === String(playerId)
  );

  if (!player) {
    return { state, error: "Player not found." };
  }

  if (hasPlayerAnswered(state, player.id)) {
    return { state, error: "You have already answered this question." };
  }

  const question = state.currentQuestion;

  if (!question) {
    return { state, error: "No active question." };
  }

  const normalizedAnswer = normalizeNumberAnswer(answer);
  const normalizedCorrect = normalizeNumberAnswer(
    question.correctAnswer
  );

  const isCorrect =
    normalizedAnswer.toLowerCase() === normalizedCorrect.toLowerCase();

  const points = calculateNumberPoints({
    isCorrect,
    elapsedSeconds,
  });

  const answerRecord = {
    playerId: player.id,
    answer: normalizedAnswer,
    isCorrect,
    points,
    elapsedSeconds,
  };

  const nextAnswers = {
    ...state.answers,
    [player.id]: answerRecord,
  };

  const nextPlayers = state.players.map((item) =>
    item.id === player.id
      ? {
          ...item,
          score: item.score + points,
          hasAnswered: true,
          answer: normalizedAnswer,
          isCorrect,
        }
      : item
  );

  const nextState = {
    ...state,
    answers: nextAnswers,
    players: nextPlayers,
  };

  if (allNumberPlayersAnswered(nextState)) {
    return {
      state: {
        ...nextState,
        status: NUMBER_BATTLE_STATUS.ROUND_RESULT,
      },
      answerRecord,
      error: null,
    };
  }

  return {
    state: nextState,
    answerRecord,
    error: null,
  };
}

export function revealNumberRoundResult(state) {
  if (!state.currentQuestion) return state;

  return {
    ...state,
    status: NUMBER_BATTLE_STATUS.ROUND_RESULT,
  };
}

export function advanceNumberRound(state) {
  const nextIndex = state.currentQuestionIndex + 1;

  if (
    nextIndex >= state.totalRounds ||
    nextIndex >= state.questions.length
  ) {
    return finishNumberBattle(state);
  }

  return {
    ...state,
    status: NUMBER_BATTLE_STATUS.PLAYING,
    currentQuestionIndex: nextIndex,
    currentQuestion: state.questions[nextIndex],
    answers: {},
    players: state.players.map((player) => ({
      ...player,
      hasAnswered: false,
      answer: null,
      isCorrect: false,
    })),
  };
}

export function finishNumberBattle(state) {
  const sortedPlayers = [...state.players].sort(
    (a, b) => b.score - a.score
  );

  const highestScore = sortedPlayers[0]?.score ?? 0;
  const winners = sortedPlayers.filter(
    (player) => player.score === highestScore
  );

  return {
    ...state,
    status: NUMBER_BATTLE_STATUS.FINISHED,
    winner: winners.length === 1 ? winners[0] : null,
    isDraw: winners.length > 1,
    finishedAt: Date.now(),
  };
}

export function getNumberBattleLeaderboard(players = []) {
  return [...players]
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
}
