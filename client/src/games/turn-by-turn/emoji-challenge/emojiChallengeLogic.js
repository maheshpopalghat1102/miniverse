
export const EMOJI_CHALLENGE_CONFIG = {
  TOTAL_ROUNDS: 10,
  POINTS_CORRECT: 100,
  MAX_HINTS: 2,
};

export const EMOJI_CHALLENGE_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  ROUND_RESULT: "round-result",
  FINISHED: "finished",
};

export const SAMPLE_EMOJI_CHALLENGES = [
  {
    questionId: "emoji-001",
    emoji: "🦁👑",
    category: "Movies",
    hint: "An animated movie about a young lion.",
    answer: "THE LION KING",
    acceptedAnswers: ["LION KING"],
    extraHints: ["It is a Disney movie.", "Simba is the main character."],
    difficulty: "easy",
  },
  {
    questionId: "emoji-002",
    emoji: "🕷️👨",
    category: "Superheroes",
    hint: "A superhero who climbs walls.",
    answer: "SPIDER MAN",
    acceptedAnswers: ["SPIDERMAN"],
    extraHints: ["He uses webs.", "His real name is Peter Parker."],
    difficulty: "easy",
  },
  {
    questionId: "emoji-003",
    emoji: "🌧️☂️",
    category: "Everyday Phrases",
    hint: "Something you use when it rains.",
    answer: "UMBRELLA",
    acceptedAnswers: ["RAIN UMBRELLA"],
    extraHints: ["You hold it above your head.", "It helps keep you dry."],
    difficulty: "easy",
  },
  {
    questionId: "emoji-004",
    emoji: "🧊☕",
    category: "Food and Drinks",
    hint: "A cold coffee drink.",
    answer: "ICED COFFEE",
    acceptedAnswers: ["ICE COFFEE"],
    extraHints: ["It is served cold.", "It often contains ice cubes."],
    difficulty: "easy",
  },
  {
    questionId: "emoji-005",
    emoji: "🚢🧊",
    category: "Movies",
    hint: "A famous romantic disaster movie.",
    answer: "TITANIC",
    acceptedAnswers: ["THE TITANIC"],
    extraHints: ["It stars Jack and Rose.", "The ship hits an iceberg."],
    difficulty: "medium",
  },
  {
    questionId: "emoji-006",
    emoji: "🧙‍♂️⚡",
    category: "Books and Movies",
    hint: "A young wizard with a lightning-shaped scar.",
    answer: "HARRY POTTER",
    acceptedAnswers: ["HARRYPOTTER"],
    extraHints: ["He attends Hogwarts.", "His friends include Ron and Hermione."],
    difficulty: "medium",
  },
  {
    questionId: "emoji-007",
    emoji: "🌍🕊️",
    category: "Nature",
    hint: "A worldwide hope for harmony.",
    answer: "WORLD PEACE",
    acceptedAnswers: ["PEACE"],
    extraHints: ["It means no war.", "It is a common global wish."],
    difficulty: "medium",
  },
  {
    questionId: "emoji-008",
    emoji: "🐝🍯",
    category: "Animals and Nature",
    hint: "A sweet substance made by insects.",
    answer: "HONEY",
    acceptedAnswers: ["BEE HONEY"],
    extraHints: ["Bees produce it.", "It is often golden in color."],
    difficulty: "easy",
  },
  {
    questionId: "emoji-009",
    emoji: "🌙🚶",
    category: "Phrases",
    hint: "A person walking outside at night.",
    answer: "NIGHT WALK",
    acceptedAnswers: ["WALK AT NIGHT"],
    extraHints: ["It happens after sunset.", "It can be a relaxing activity."],
    difficulty: "medium",
  },
  {
    questionId: "emoji-010",
    emoji: "🎂🎉🎁",
    category: "Celebrations",
    hint: "A celebration of the day someone was born.",
    answer: "BIRTHDAY",
    acceptedAnswers: ["BIRTHDAY PARTY"],
    extraHints: ["It happens once a year.", "People often bring cake and gifts."],
    difficulty: "easy",
  },
];

export function normalizeEmojiAnswer(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function isEmojiAnswerCorrect(question, answer) {
  if (!question || !answer) return false;

  const normalizedAnswer = normalizeEmojiAnswer(answer);

  const accepted = [
    question.answer,
    ...(question.acceptedAnswers || []),
  ].map(normalizeEmojiAnswer);

  return accepted.includes(normalizedAnswer);
}

export function shuffleEmojiQuestions(questions = []) {
  const result = [...questions];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export function normalizeEmojiPlayers(players = []) {
  return players.map((player, index) => ({
    id: String(player.id || player._id || `player-${index + 1}`),
    name: player.name || player.username || `Player ${index + 1}`,
    score: Number(player.score || 0),
    isMe: Boolean(player.isMe),
  }));
}

export function createInitialEmojiChallengeState({
  players = [],
  questions = SAMPLE_EMOJI_CHALLENGES,
  totalRounds = EMOJI_CHALLENGE_CONFIG.TOTAL_ROUNDS,
} = {}) {
  const validQuestions = questions.filter(
    (question) =>
      question &&
      question.questionId &&
      question.emoji &&
      question.hint &&
      question.answer
  );

  return {
    status: EMOJI_CHALLENGE_STATUS.WAITING,
    players: normalizeEmojiPlayers(players).slice(0, 2),
    questions: validQuestions.slice(0, totalRounds),
    currentRoundIndex: 0,
    currentQuestion: null,
    currentTurnIndex: 0,
    hintsUsed: 0,
    answers: {},
    totalRounds: Math.min(totalRounds, validQuestions.length),
    winner: null,
    isDraw: false,
  };
}

export function startEmojiChallenge(state) {
  if (state.players.length !== 2 || !state.questions.length) {
    return state;
  }

  return {
    ...state,
    status: EMOJI_CHALLENGE_STATUS.PLAYING,
    currentRoundIndex: 0,
    currentQuestion: state.questions[0],
    currentTurnIndex: 0,
    hintsUsed: 0,
    answers: {},
  };
}

export function getCurrentEmojiPlayer(state) {
  return state.players[state.currentTurnIndex] || null;
}

export function revealEmojiHint(state) {
  if (state.status !== EMOJI_CHALLENGE_STATUS.PLAYING) return state;

  if (state.hintsUsed >= EMOJI_CHALLENGE_CONFIG.MAX_HINTS) {
    return state;
  }

  return {
    ...state,
    hintsUsed: state.hintsUsed + 1,
  };
}

export function getVisibleEmojiHints(state) {
  return (state.currentQuestion?.extraHints || []).slice(
    0,
    state.hintsUsed
  );
}

export function submitEmojiChallengeAnswer(state, playerId, answer) {
  if (state.status !== EMOJI_CHALLENGE_STATUS.PLAYING) {
    return { state, error: "The challenge is not accepting answers." };
  }

  const player = getCurrentEmojiPlayer(state);

  if (!player || player.id !== String(playerId)) {
    return { state, error: "It is not your turn." };
  }

  if (state.answers[player.id] !== undefined) {
    return { state, error: "You have already answered this round." };
  }

  if (!String(answer ?? "").trim()) {
    return { state, error: "Enter an answer first." };
  }

  const isCorrect = isEmojiAnswerCorrect(
    state.currentQuestion,
    answer
  );

  const points = isCorrect
    ? Math.max(
        25,
        EMOJI_CHALLENGE_CONFIG.POINTS_CORRECT -
          state.hintsUsed * 25
      )
    : 0;

  const playerAnswer = {
    playerId: player.id,
    answer: String(answer).trim(),
    isCorrect,
    points,
  };

  const nextAnswers = {
    ...state.answers,
    [player.id]: playerAnswer,
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
        ? EMOJI_CHALLENGE_STATUS.ROUND_RESULT
        : EMOJI_CHALLENGE_STATUS.PLAYING,
    },
    answer: playerAnswer,
    error: null,
  };
}

export function advanceEmojiChallengeRound(state) {
  const nextIndex = state.currentRoundIndex + 1;

  if (nextIndex >= state.totalRounds) {
    return finishEmojiChallenge(state);
  }

  return {
    ...state,
    status: EMOJI_CHALLENGE_STATUS.PLAYING,
    currentRoundIndex: nextIndex,
    currentQuestion: state.questions[nextIndex],
    currentTurnIndex: 0,
    hintsUsed: 0,
    answers: {},
  };
}

export function finishEmojiChallenge(state) {
  const [first, second] = state.players;

  const winner =
    first.score === second.score
      ? null
      : first.score > second.score
        ? first
        : second;

  return {
    ...state,
    status: EMOJI_CHALLENGE_STATUS.FINISHED,
    winner,
    isDraw: !winner,
  };
}

export function getEmojiChallengeLeaderboard(players = []) {
  return [...players]
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
}
