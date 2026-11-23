
export const TRUTH_DARE_CATEGORIES = [
  {
    id: "normal",
    name: "Normal",
    description: "Simple and fun questions and challenges.",
    icon: "🎮",
    color: "blue",
    adultOnly: false,
  },
  {
    id: "adult-18-plus",
    name: "Adult 18+",
    description: "Mature prompts for consenting adults.",
    icon: "🔞",
    color: "red",
    adultOnly: true,
  },
  {
    id: "private",
    name: "Private",
    description: "Personal questions and private challenges.",
    icon: "🔐",
    color: "purple",
    adultOnly: false,
  },
  {
    id: "couples",
    name: "Couples",
    description: "Romantic questions and couple challenges.",
    icon: "❤️",
    color: "pink",
    adultOnly: false,
  },
  {
    id: "friends-party",
    name: "Friends & Party",
    description: "Playful prompts for friends and parties.",
    icon: "🎉",
    color: "orange",
    adultOnly: false,
  },
  {
    id: "funny-crazy",
    name: "Funny & Crazy",
    description: "Silly questions and hilarious challenges.",
    icon: "😂",
    color: "yellow",
    adultOnly: false,
  },
  {
    id: "long-distance-couples",
    name: "Long Distance Couples",
    description: "Stay connected across the distance.",
    icon: "🌍",
    color: "green",
    adultOnly: false,
  },
];

export const TRUTH_DARE_TYPES = {
  TRUTH: "truth",
  DARE: "dare",
};

export const GAME_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  COMPLETED: "completed",
};

export const isValidCategory = (categoryId) =>
  TRUTH_DARE_CATEGORIES.some((category) => category.id === categoryId);

export const getCategoryById = (categoryId) =>
  TRUTH_DARE_CATEGORIES.find((category) => category.id === categoryId) || null;

export const isValidPromptType = (type) =>
  Object.values(TRUTH_DARE_TYPES).includes(type);

export const validatePrompt = (prompt) => {
  if (!prompt || typeof prompt !== "object") {
    return false;
  }

  return (
    typeof prompt.promptId === "string" &&
    prompt.promptId.trim().length > 0 &&
    typeof prompt.content === "string" &&
    prompt.content.trim().length > 0 &&
    isValidPromptType(prompt.type) &&
    isValidCategory(prompt.category)
  );
};

export const normalizePlayerList = (players = []) => {
  if (!Array.isArray(players)) {
    return [];
  }

  const seen = new Set();

  return players
    .filter((player) => {
      const id = String(player?.id || player?._id || "").trim();
      const name = String(player?.name || player?.username || "").trim();

      if (!id || !name || seen.has(id)) {
        return false;
      }

      seen.add(id);
      return true;
    })
    .map((player) => ({
      id: String(player.id || player._id),
      name: String(player.name || player.username),
      avatar: player.avatar || null,
      isMe: Boolean(player.isMe),
    }));
};

export const createInitialTruthDareState = (players = []) => {
  const normalizedPlayers = normalizePlayerList(players);

  return {
    category: null,
    players: normalizedPlayers,
    currentPlayerIndex: 0,
    currentPlayerId: normalizedPlayers[0]?.id || null,
    currentPrompt: null,
    promptHistory: [],
    status: normalizedPlayers.length >= 2
      ? GAME_STATUS.WAITING
      : GAME_STATUS.WAITING,
    round: 1,
    completedTurns: 0,
  };
};

export const setGameCategory = (state, categoryId) => {
  if (!isValidCategory(categoryId)) {
    throw new Error("Invalid game category.");
  }

  return {
    ...state,
    category: categoryId,
    currentPrompt: null,
    promptHistory: [],
    currentPlayerIndex: 0,
    currentPlayerId: state.players[0]?.id || null,
    status: GAME_STATUS.PLAYING,
  };
};

export const getCurrentPlayer = (state) => {
  if (!state?.players?.length) {
    return null;
  }

  return (
    state.players.find(
      (player) => player.id === state.currentPlayerId
    ) || null
  );
};

export const getNextPlayer = (state) => {
  if (!state?.players?.length) {
    return null;
  }

  const nextIndex =
    (state.currentPlayerIndex + 1) % state.players.length;

  return state.players[nextIndex] || null;
};

export const assignPrompt = (state, prompt) => {
  if (!validatePrompt(prompt)) {
    throw new Error("Invalid Truth or Dare prompt.");
  }

  if (prompt.category !== state.category) {
    throw new Error("Prompt does not match the selected category.");
  }

  const alreadyUsed = state.promptHistory.some(
    (item) => item.promptId === prompt.promptId
  );

  if (alreadyUsed) {
    throw new Error("This prompt has already been used.");
  }

  return {
    ...state,
    currentPrompt: prompt,
    promptHistory: [
      ...state.promptHistory,
      {
        promptId: prompt.promptId,
        type: prompt.type,
        category: prompt.category,
      },
    ],
    status: GAME_STATUS.PLAYING,
  };
};

export const selectNextPlayer = (state) => {
  if (!state.players.length) {
    return state;
  }

  const nextIndex =
    (state.currentPlayerIndex + 1) % state.players.length;

  return {
    ...state,
    currentPlayerIndex: nextIndex,
    currentPlayerId: state.players[nextIndex].id,
    currentPrompt: null,
    completedTurns: state.completedTurns + 1,
    round:
      nextIndex === 0
        ? state.round + 1
        : state.round,
    status: GAME_STATUS.PLAYING,
  };
};

export const filterAvailablePrompts = (
  prompts = [],
  category,
  type,
  usedPromptIds = []
) => {
  const used = new Set(usedPromptIds);

  return prompts.filter(
    (prompt) =>
      validatePrompt(prompt) &&
      prompt.category === category &&
      prompt.type === type &&
      !used.has(prompt.promptId)
  );
};

export const getRandomPrompt = (
  prompts = [],
  category,
  type,
  usedPromptIds = []
) => {
  const available = filterAvailablePrompts(
    prompts,
    category,
    type,
    usedPromptIds
  );

  if (!available.length) {
    return null;
  }

  const index = Math.floor(Math.random() * available.length);
  return available[index];
};
