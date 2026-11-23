
export const GAME_CATEGORIES = Object.freeze({
  MULTIPLAYER: "multiplayer",
  SINGLE_PLAYER: "single-player",
  TURN_BY_TURN: "turn-by-turn",
});

export const GAME_DIFFICULTIES = Object.freeze({
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
});

export const GAME_MODES = Object.freeze({
  ONLINE: "online",
  LOCAL: "local",
  SOLO: "solo",
  TURN_BY_TURN: "turn-by-turn",
});

export const GAME_CONFIG = [
  // 12 Multiplayer games
  {
    gameId: "tic-tac-toe",
    name: "Tic Tac Toe",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 2,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["online", "local"],
    icon: "grid-3x3",
    featured: true,
  },
  {
    gameId: "rock-paper-scissors",
    name: "Rock Paper Scissors",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 2,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["online", "local"],
    icon: "hand",
    featured: true,
  },
  {
    gameId: "connect-four",
    name: "Connect Four",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 2,
    difficulty: GAME_DIFFICULTIES.MEDIUM,
    modes: ["online", "local"],
    icon: "circle-dot",
    featured: true,
  },
  {
    gameId: "guess-number",
    name: "Guess the Number",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 2,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["online", "local"],
    icon: "hash",
    featured: false,
  },
  {
    gameId: "word-battle",
    name: "Word Battle",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 4,
    difficulty: GAME_DIFFICULTIES.MEDIUM,
    modes: ["online", "local"],
    icon: "book-open",
    featured: true,
  },
  {
    gameId: "quiz-battle",
    name: "Quiz Battle",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 4,
    difficulty: GAME_DIFFICULTIES.MEDIUM,
    modes: ["online", "local"],
    icon: "brain",
    featured: true,
  },
  {
    gameId: "emoji-guess",
    name: "Emoji Guess",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 4,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["online", "local"],
    icon: "smile",
    featured: false,
  },
  {
    gameId: "truth-or-dare",
    name: "Truth or Dare",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 8,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["online", "local"],
    icon: "flame",
    featured: true,
  },
  {
    gameId: "guess-picture",
    name: "Guess the Picture",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 4,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["online", "local"],
    icon: "image",
    featured: false,
  },
  {
    gameId: "draw-guess",
    name: "Draw and Guess",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 8,
    difficulty: GAME_DIFFICULTIES.MEDIUM,
    modes: ["online", "local"],
    icon: "pencil",
    featured: true,
  },
  {
    gameId: "who-am-i",
    name: "Who Am I?",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 8,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["online", "local"],
    icon: "user-question",
    featured: false,
  },
  {
    gameId: "number-battle",
    name: "Number Battle",
    category: GAME_CATEGORIES.MULTIPLAYER,
    minPlayers: 2,
    maxPlayers: 4,
    difficulty: GAME_DIFFICULTIES.MEDIUM,
    modes: ["online", "local"],
    icon: "calculator",
    featured: false,
  },

  // 4 Single-player games
  {
    gameId: "snake",
    name: "Snake",
    category: GAME_CATEGORIES.SINGLE_PLAYER,
    minPlayers: 1,
    maxPlayers: 1,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["solo"],
    icon: "activity",
    featured: true,
  },
  {
    gameId: "2048",
    name: "2048",
    category: GAME_CATEGORIES.SINGLE_PLAYER,
    minPlayers: 1,
    maxPlayers: 1,
    difficulty: GAME_DIFFICULTIES.MEDIUM,
    modes: ["solo"],
    icon: "grid-2x2",
    featured: true,
  },
  {
    gameId: "memory-match",
    name: "Memory Match",
    category: GAME_CATEGORIES.SINGLE_PLAYER,
    minPlayers: 1,
    maxPlayers: 1,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["solo"],
    icon: "copy",
    featured: false,
  },
  {
    gameId: "number-puzzle",
    name: "Number Puzzle",
    category: GAME_CATEGORIES.SINGLE_PLAYER,
    minPlayers: 1,
    maxPlayers: 1,
    difficulty: GAME_DIFFICULTIES.MEDIUM,
    modes: ["solo"],
    icon: "puzzle",
    featured: false,
  },

  // 4 Turn-by-turn games
  {
    gameId: "couple-quiz",
    name: "Couple Quiz",
    category: GAME_CATEGORIES.TURN_BY_TURN,
    minPlayers: 2,
    maxPlayers: 2,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["online", "local", "turn-by-turn"],
    icon: "heart",
    featured: true,
  },
  {
    gameId: "guess-word",
    name: "Guess the Word",
    category: GAME_CATEGORIES.TURN_BY_TURN,
    minPlayers: 2,
    maxPlayers: 2,
    difficulty: GAME_DIFFICULTIES.MEDIUM,
    modes: ["online", "local", "turn-by-turn"],
    icon: "text",
    featured: false,
  },
  {
    gameId: "emoji-challenge",
    name: "Emoji Challenge",
    category: GAME_CATEGORIES.TURN_BY_TURN,
    minPlayers: 2,
    maxPlayers: 4,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["online", "local", "turn-by-turn"],
    icon: "message-circle",
    featured: false,
  },
  {
    gameId: "story-builder",
    name: "Story Builder",
    category: GAME_CATEGORIES.TURN_BY_TURN,
    minPlayers: 2,
    maxPlayers: 4,
    difficulty: GAME_DIFFICULTIES.EASY,
    modes: ["online", "local", "turn-by-turn"],
    icon: "book",
    featured: true,
  },
];

export const ALL_GAME_IDS = GAME_CONFIG.map(
  (game) => game.gameId
);

export const MULTIPLAYER_GAMES = GAME_CONFIG.filter(
  (game) => game.category === GAME_CATEGORIES.MULTIPLAYER
);

export const SINGLE_PLAYER_GAMES = GAME_CONFIG.filter(
  (game) => game.category === GAME_CATEGORIES.SINGLE_PLAYER
);

export const TURN_BY_TURN_GAMES = GAME_CONFIG.filter(
  (game) => game.category === GAME_CATEGORIES.TURN_BY_TURN
);

export const FEATURED_GAMES = GAME_CONFIG.filter(
  (game) => game.featured
);

export function getGameConfig(gameId) {
  return GAME_CONFIG.find((game) => game.gameId === gameId) || null;
}

export function getGamesByCategory(category) {
  return GAME_CONFIG.filter((game) => game.category === category);
}

export function isValidGameId(gameId) {
  return ALL_GAME_IDS.includes(gameId);
}

export function getPlayerLimits(gameId) {
  const game = getGameConfig(gameId);

  return game
    ? { minPlayers: game.minPlayers, maxPlayers: game.maxPlayers }
    : null;
}

export default GAME_CONFIG;
