
export const SAMPLE_EMOJI_QUESTIONS = [
  {
    id: "emoji-001",
    category: "Movies",
    emojis: "🦁👑",
    question: "Guess the movie",
    answer: "the lion king",
    options: ["The Lion King", "Madagascar", "Jungle Book", "Tarzan"],
    points: 10,
    hint: "A famous story about a lion prince.",
  },
  {
    id: "emoji-002",
    category: "Objects",
    emojis: "📱🔋",
    question: "Guess the object",
    answer: "mobile charger",
    options: ["Mobile Charger", "Headphones", "Power Bank", "Laptop"],
    points: 10,
    hint: "Used to give power to your phone.",
  },
  {
    id: "emoji-003",
    category: "Food",
    emojis: "🍎🥧",
    question: "Guess the food",
    answer: "apple pie",
    options: ["Apple Pie", "Fruit Salad", "Apple Juice", "Cake"],
    points: 10,
    hint: "A baked dessert made with fruit.",
  },
  {
    id: "emoji-004",
    category: "Phrases",
    emojis: "🌧️🐱🐶",
    question: "Guess the phrase",
    answer: "raining cats and dogs",
    options: [
      "Raining Cats and Dogs",
      "Animal Kingdom",
      "Heavy Traffic",
      "Stormy Night",
    ],
    points: 10,
    hint: "An expression describing very heavy rain.",
  },
  {
    id: "emoji-005",
    category: "Movies",
    emojis: "🕷️👨",
    question: "Guess the character",
    answer: "spiderman",
    options: ["Batman", "Superman", "Spiderman", "Iron Man"],
    points: 10,
    hint: "A superhero who climbs walls.",
  },
];

export function normalizeEmojiAnswer(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function validateEmojiQuestion(question) {
  return Boolean(
    question &&
    typeof question.id === "string" &&
    typeof question.emojis === "string" &&
    question.emojis.trim() &&
    typeof question.answer === "string" &&
    question.answer.trim() &&
    Array.isArray(question.options) &&
    question.options.length >= 2 &&
    question.options.every(
      (option) => typeof option === "string" && option.trim()
    ) &&
    Number.isFinite(question.points) &&
    question.points >= 0
  );
}

export function checkEmojiAnswer(question, answer) {
  if (!validateEmojiQuestion(question)) {
    throw new Error("Invalid emoji question.");
  }

  return (
    normalizeEmojiAnswer(answer) ===
    normalizeEmojiAnswer(question.answer)
  );
}

export function createInitialEmojiState(questions = SAMPLE_EMOJI_QUESTIONS) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("No emoji questions are available.");
  }

  if (!questions.every(validateEmojiQuestion)) {
    throw new Error("One or more emoji questions are invalid.");
  }

  return {
    questions,
    currentQuestionIndex: 0,
    currentPlayer: "X",
    scores: { X: 0, O: 0 },
    answers: [],
    status: "playing",
    winner: null,
  };
}

export function submitEmojiAnswer(state, player, answer) {
  if (!state || state.status !== "playing") {
    throw new Error("The game is not active.");
  }

  if (!["X", "O"].includes(player)) {
    throw new Error("Invalid player.");
  }

  if (player !== state.currentPlayer) {
    throw new Error("It is not your turn.");
  }

  const question = state.questions[state.currentQuestionIndex];

  if (!question) {
    throw new Error("Question not found.");
  }

  const correct = checkEmojiAnswer(question, answer);
  const points = correct ? question.points : 0;

  const scores = {
    ...state.scores,
    [player]: state.scores[player] + points,
  };

  const historyEntry = {
    player,
    questionId: question.id,
    answer: String(answer),
    correct,
    points,
  };

  const isLastQuestion =
    state.currentQuestionIndex === state.questions.length - 1;

  const nextPlayer = player === "X" ? "O" : "X";

  let status = "playing";
  let winner = null;
  let currentQuestionIndex = state.currentQuestionIndex;

  if (player === "X") {
    // Player O gets a chance to answer the same question.
  } else if (isLastQuestion) {
    status = "finished";

    if (scores.X > scores.O) winner = "X";
    else if (scores.O > scores.X) winner = "O";
    else winner = "draw";
  } else {
    currentQuestionIndex += 1;
  }

  return {
    ...state,
    scores,
    answers: [...state.answers, historyEntry],
    currentPlayer: nextPlayer,
    currentQuestionIndex,
    status,
    winner,
  };
}

export function getCurrentEmojiQuestion(state) {
  if (!state || state.status !== "playing") return null;

  return state.questions[state.currentQuestionIndex] ?? null;
}
