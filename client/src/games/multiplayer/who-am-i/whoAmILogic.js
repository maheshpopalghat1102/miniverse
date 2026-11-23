
export const WHO_AM_I_CONFIG = {
  MAX_HINTS: 4,
  POINTS_FOR_CORRECT_GUESS: 100,
  HINT_PENALTY: 15,
  MAX_GUESS_LENGTH: 60,
};

export const WHO_AM_I_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  ANSWERED: "answered",
  COMPLETED: "completed",
};

export const SAMPLE_IDENTITIES = [
  {
    identityId: "identity-001",
    name: "Spider-Man",
    category: "Superheroes",
    description: "A famous superhero.",
    clues: [
      "I am known for climbing walls.",
      "I can shoot webs.",
      "I have a spider symbol.",
      "My real name is Peter Parker.",
    ],
    difficulty: "easy",
    points: 100,
  },
  {
    identityId: "identity-002",
    name: "Albert Einstein",
    category: "Famous People",
    description: "A famous scientist.",
    clues: [
      "I was born in Germany.",
      "I developed the theory of relativity.",
      "I received a Nobel Prize in Physics.",
      "My famous equation is E = mc².",
    ],
    difficulty: "medium",
    points: 100,
  },
  {
    identityId: "identity-003",
    name: "Taj Mahal",
    category: "Places",
    description: "A famous monument.",
    clues: [
      "I am located in India.",
      "I am made primarily of white marble.",
      "I am located beside the Yamuna River.",
      "Shah Jahan built me in memory of Mumtaz Mahal.",
    ],
    difficulty: "easy",
    points: 100,
  },
  {
    identityId: "identity-004",
    name: "Dolphin",
    category: "Animals",
    description: "A marine animal.",
    clues: [
      "I live in water.",
      "I breathe air through a blowhole.",
      "I am known for being intelligent.",
      "I communicate using clicks and whistles.",
    ],
    difficulty: "easy",
    points: 100,
  },
  {
    identityId: "identity-005",
    name: "William Shakespeare",
    category: "Literature",
    description: "A famous writer.",
    clues: [
      "I lived in England.",
      "I wrote tragedies and comedies.",
      "One of my famous works is Hamlet.",
      "I am often called the Bard of Avon.",
    ],
    difficulty: "hard",
    points: 100,
  },
];

export const normalizeIdentityAnswer = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

export const validateIdentity = (identity) => {
  if (!identity || typeof identity !== "object") {
    return false;
  }

  return (
    typeof identity.identityId === "string" &&
    identity.identityId.trim().length > 0 &&
    typeof identity.name === "string" &&
    identity.name.trim().length > 0 &&
    typeof identity.category === "string" &&
    Array.isArray(identity.clues) &&
    identity.clues.length > 0 &&
    identity.clues.every(
      (clue) => typeof clue === "string" && clue.trim().length > 0
    )
  );
};

export const validateIdentityGuess = (guess) => {
  const value = String(guess || "").trim();

  return (
    value.length >= 1 &&
    value.length <= WHO_AM_I_CONFIG.MAX_GUESS_LENGTH
  );
};

export const checkIdentityGuess = (guess, identity) => {
  if (!validateIdentity(identity)) {
    return false;
  }

  return (
    normalizeIdentityAnswer(guess) ===
    normalizeIdentityAnswer(identity.name)
  );
};

export const normalizeWhoAmIPlayers = (players = []) => {
  if (!Array.isArray(players)) return [];

  const seen = new Set();

  return players
    .map((player) => ({
      id: String(player.id || player._id || ""),
      name: String(player.name || player.username || "Player"),
      avatar: player.avatar || null,
      score: Number(player.score) || 0,
      isMe: Boolean(player.isMe),
    }))
    .filter((player) => {
      if (!player.id || seen.has(player.id)) return false;

      seen.add(player.id);
      return true;
    });
};

export const createInitialWhoAmIState = (players = []) => {
  const normalizedPlayers = normalizeWhoAmIPlayers(players);

  return {
    players: normalizedPlayers,
    currentPlayerIndex: 0,
    currentPlayerId: normalizedPlayers[0]?.id || null,
    identity: null,
    visibleClues: [],
    guessHistory: [],
    hintsUsed: 0,
    pointsEarned: 0,
    round: 1,
    totalRounds: normalizedPlayers.length,
    status: WHO_AM_I_STATUS.WAITING,
  };
};

export const startWhoAmIRound = (
  state,
  identity,
  roundNumber = state.round
) => {
  if (!validateIdentity(identity)) {
    throw new Error("Invalid identity data.");
  }

  return {
    ...state,
    identity,
    visibleClues: [],
    guessHistory: [],
    hintsUsed: 0,
    pointsEarned: 0,
    round: roundNumber,
    status: WHO_AM_I_STATUS.PLAYING,
  };
};

export const revealNextClue = (state) => {
  if (state.status !== WHO_AM_I_STATUS.PLAYING) {
    throw new Error("The game is not accepting clues.");
  }

  if (!state.identity) {
    throw new Error("No identity has been assigned.");
  }

  if (state.visibleClues.length >= state.identity.clues.length) {
    throw new Error("No more clues are available.");
  }

  if (
    state.visibleClues.length >= WHO_AM_I_CONFIG.MAX_HINTS
  ) {
    throw new Error("Maximum number of clues reached.");
  }

  const nextIndex = state.visibleClues.length;

  return {
    ...state,
    visibleClues: [
      ...state.visibleClues,
      state.identity.clues[nextIndex],
    ],
    hintsUsed: state.hintsUsed + 1,
  };
};

export const submitIdentityGuess = (state, guess) => {
  if (state.status !== WHO_AM_I_STATUS.PLAYING) {
    throw new Error("This round is not accepting guesses.");
  }

  if (!state.identity) {
    throw new Error("No identity is assigned.");
  }

  if (!validateIdentityGuess(guess)) {
    throw new Error("Please enter a valid guess.");
  }

  const normalizedGuess = normalizeIdentityAnswer(guess);

  const alreadySubmitted = state.guessHistory.some(
    (item) =>
      item.playerId === state.currentPlayerId &&
      normalizeIdentityAnswer(item.guess) === normalizedGuess
  );

  if (alreadySubmitted) {
    throw new Error("You already submitted this guess.");
  }

  const isCorrect = checkIdentityGuess(guess, state.identity);

  const penalty =
    state.hintsUsed * WHO_AM_I_CONFIG.HINT_PENALTY;

  const basePoints =
    state.identity.points ||
    WHO_AM_I_CONFIG.POINTS_FOR_CORRECT_GUESS;

  const pointsEarned = isCorrect
    ? Math.max(10, basePoints - penalty)
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
    guessHistory: [
      ...state.guessHistory,
      {
        playerId: state.currentPlayerId,
        guess: String(guess).trim(),
        isCorrect,
        pointsEarned,
      },
    ],
    pointsEarned,
    status: isCorrect
      ? WHO_AM_I_STATUS.ANSWERED
      : WHO_AM_I_STATUS.PLAYING,
  };
};

export const revealIdentityAnswer = (state) => {
  if (!state.identity) return state;

  return {
    ...state,
    status: WHO_AM_I_STATUS.ANSWERED,
  };
};

export const advanceWhoAmIRound = (state, nextIdentity) => {
  const nextIndex =
    (state.currentPlayerIndex + 1) % state.players.length;

  const nextRound = state.round + 1;

  if (nextRound > state.totalRounds) {
    return {
      ...state,
      identity: null,
      status: WHO_AM_I_STATUS.COMPLETED,
    };
  }

  const nextState = {
    ...state,
    currentPlayerIndex: nextIndex,
    currentPlayerId: state.players[nextIndex].id,
    round: nextRound,
  };

  return startWhoAmIRound(nextState, nextIdentity, nextRound);
};

export const getWhoAmIWinner = (players = []) => {
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

export const getRandomIdentity = (
  identities = [],
  usedIdentityIds = []
) => {
  const used = new Set(usedIdentityIds);

  const available = identities.filter(
    (identity) =>
      validateIdentity(identity) &&
      !used.has(identity.identityId)
  );

  if (!available.length) return null;

  return available[Math.floor(Math.random() * available.length)];
};
