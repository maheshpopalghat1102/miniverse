
export const DEFAULT_QUESTION_TIME = 20;
export const DEFAULT_QUESTION_POINTS = 10;

export const SAMPLE_QUESTIONS = [
  {
    id: "general-001",
    category: "General Knowledge",
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctIndex: 1,
    explanation: "Mars appears reddish because of iron oxide on its surface.",
    points: 10,
  },
  {
    id: "science-001",
    category: "Science",
    question: "What is the chemical symbol for water?",
    options: ["CO2", "O2", "H2O", "NaCl"],
    correctIndex: 2,
    explanation: "A water molecule contains two hydrogen atoms and one oxygen atom.",
    points: 10,
  },
  {
    id: "technology-001",
    category: "Technology",
    question: "What does CPU stand for?",
    options: [
      "Central Processing Unit",
      "Computer Personal Unit",
      "Central Program Utility",
      "Control Processing User",
    ],
    correctIndex: 0,
    explanation: "CPU stands for Central Processing Unit.",
    points: 10,
  },
  {
    id: "general-002",
    category: "General Knowledge",
    question: "How many sides does a hexagon have?",
    options: ["Five", "Six", "Seven", "Eight"],
    correctIndex: 1,
    explanation: "A hexagon has six sides.",
    points: 10,
  },
  {
    id: "science-002",
    category: "Science",
    question: "Which gas do plants absorb during photosynthesis?",
    options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
    correctIndex: 2,
    explanation: "Plants absorb carbon dioxide during photosynthesis.",
    points: 10,
  },
];

export function validateQuestion(question) {
  return Boolean(
    question &&
    typeof question.question === "string" &&
    question.question.trim() &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    question.options.every(
      (option) => typeof option === "string" && option.trim()
    ) &&
    Number.isInteger(question.correctIndex) &&
    question.correctIndex >= 0 &&
    question.correctIndex < 4
  );
}

export function createInitialQuizState(questions = SAMPLE_QUESTIONS) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("At least one quiz question is required.");
  }

  if (!questions.every(validateQuestion)) {
    throw new Error("One or more quiz questions are invalid.");
  }

  return {
    questions,
    currentQuestionIndex: 0,
    answers: {
      X: [],
      O: [],
    },
    scores: {
      X: 0,
      O: 0,
    },
    status: "playing",
    winner: null,
  };
}

export function getCurrentQuestion(state) {
  if (!state || state.status !== "playing") return null;

  return state.questions[state.currentQuestionIndex] ?? null;
}

export function validateAnswer(answerIndex) {
  return (
    Number.isInteger(answerIndex) &&
    answerIndex >= 0 &&
    answerIndex < 4
  );
}

export function submitQuizAnswer(
  state,
  player,
  answerIndex
) {
  if (!state || state.status !== "playing") {
    throw new Error("The quiz is not active.");
  }

  if (!["X", "O"].includes(player)) {
    throw new Error("Invalid player.");
  }

  if (!validateAnswer(answerIndex)) {
    throw new Error("Select a valid answer.");
  }

  const question = getCurrentQuestion(state);

  if (!question) {
    throw new Error("Question not found.");
  }

  const existingAnswers = state.answers[player];

  if (existingAnswers.some(
    (answer) => answer.questionIndex === state.currentQuestionIndex
  )) {
    throw new Error("You have already answered this question.");
  }

  const isCorrect = answerIndex === question.correctIndex;
  const points = question.points ?? DEFAULT_QUESTION_POINTS;

  const answers = {
    ...state.answers,
    [player]: [
      ...existingAnswers,
      {
        questionIndex: state.currentQuestionIndex,
        answerIndex,
        isCorrect,
        points: isCorrect ? points : 0,
      },
    ],
  };

  const scores = {
    ...state.scores,
    [player]: state.scores[player] + (isCorrect ? points : 0),
  };

  return {
    ...state,
    answers,
    scores,
  };
}

export function advanceQuizQuestion(state) {
  if (!state || state.status !== "playing") {
    throw new Error("The quiz is not active.");
  }

  const nextIndex = state.currentQuestionIndex + 1;

  if (nextIndex >= state.questions.length) {
    let winner = "draw";

    if (state.scores.X > state.scores.O) winner = "X";
    if (state.scores.O > state.scores.X) winner = "O";

    return {
      ...state,
      status: "finished",
      winner,
    };
  }

  return {
    ...state,
    currentQuestionIndex: nextIndex,
  };
}

export function getQuizProgress(state) {
  if (!state) return 0;

  return Math.round(
    ((state.currentQuestionIndex + 1) / state.questions.length) * 100
  );
}
