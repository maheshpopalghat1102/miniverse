
export const STORY_BUILDER_CONFIG = {
  MIN_SENTENCE_LENGTH: 3,
  MAX_SENTENCE_LENGTH: 220,
  DEFAULT_TURNS: 12,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,
};

export const STORY_BUILDER_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  FINISHED: "finished",
};

export const SAMPLE_STORY_PROMPTS = [
  {
    promptId: "story-001",
    title: "The Mysterious Door",
    category: "Adventure",
    description:
      "A mysterious door appears in the middle of a familiar street. Nobody knows where it leads.",
    opening:
      "On an ordinary morning, a strange door appeared in the middle of the street.",
  },
  {
    promptId: "story-002",
    title: "A Message From the Future",
    category: "Science Fiction",
    description:
      "Someone receives a message from their future self, warning them about an unexpected event.",
    opening:
      "At exactly midnight, a message arrived from a number that did not exist.",
  },
  {
    promptId: "story-003",
    title: "The Last Train",
    category: "Mystery",
    description:
      "A passenger boards the last train of the night and discovers something unusual.",
    opening:
      "The last train was almost empty when I noticed someone sitting in my seat.",
  },
  {
    promptId: "story-004",
    title: "The Forgotten Planet",
    category: "Fantasy",
    description:
      "A group of explorers discovers a planet missing from every known star map.",
    opening:
      "Our spaceship detected a planet that should not have existed.",
  },
  {
    promptId: "story-005",
    title: "The Unexpected Guest",
    category: "Comedy",
    description:
      "A quiet evening changes when an unexpected visitor arrives with a surprising request.",
    opening:
      "Everything was peaceful until someone knocked on the window.",
  },
  {
    promptId: "story-006",
    title: "The Hidden Treasure",
    category: "Adventure",
    description:
      "An old map leads a group of friends to a secret that has been hidden for generations.",
    opening:
      "Inside an old book, we found a map with a red circle around our town.",
  },
];

export function normalizeStoryPlayers(players = []) {
  return players.map((player, index) => ({
    id: String(player.id || player._id || `player-${index + 1}`),
    name: player.name || player.username || `Player ${index + 1}`,
    avatar: player.avatar || "",
    isMe: Boolean(player.isMe),
  }));
}

export function createInitialStoryState({
  players = [],
  prompt = SAMPLE_STORY_PROMPTS[0],
  maxTurns = STORY_BUILDER_CONFIG.DEFAULT_TURNS,
} = {}) {
  const normalizedPlayers = normalizeStoryPlayers(players);

  return {
    status: STORY_BUILDER_STATUS.WAITING,
    players: normalizedPlayers.slice(
      0,
      STORY_BUILDER_CONFIG.MAX_PLAYERS
    ),
    prompt,
    entries: [],
    currentTurnIndex: 0,
    maxTurns,
    turnNumber: 0,
    createdAt: null,
    completedAt: null,
    lastEntry: null,
  };
}

export function startStory(state) {
  if (
    state.players.length < STORY_BUILDER_CONFIG.MIN_PLAYERS ||
    !state.prompt
  ) {
    return state;
  }

  const opening = String(state.prompt.opening || "").trim();

  const openingEntry = opening
    ? {
        entryId: "story-opening",
        playerId: "system",
        playerName: "Story Prompt",
        content: opening,
        turnNumber: 0,
        createdAt: Date.now(),
        isOpening: true,
      }
    : null;

  return {
    ...state,
    status: STORY_BUILDER_STATUS.PLAYING,
    entries: openingEntry ? [openingEntry] : [],
    currentTurnIndex: 0,
    turnNumber: 0,
    createdAt: Date.now(),
    lastEntry: openingEntry,
  };
}

export function getCurrentStoryPlayer(state) {
  return state.players[state.currentTurnIndex] || null;
}

export function validateStorySentence(sentence) {
  const content = String(sentence ?? "").trim();

  if (content.length < STORY_BUILDER_CONFIG.MIN_SENTENCE_LENGTH) {
    return {
      valid: false,
      error: "Please write a little more before submitting.",
    };
  }

  if (content.length > STORY_BUILDER_CONFIG.MAX_SENTENCE_LENGTH) {
    return {
      valid: false,
      error: `Keep each contribution under ${STORY_BUILDER_CONFIG.MAX_SENTENCE_LENGTH} characters.`,
    };
  }

  if (!/[.!?…]$/.test(content)) {
    return {
      valid: false,
      error: "Please end your contribution with a period, question mark, or exclamation mark.",
    };
  }

  return {
    valid: true,
    content,
    error: null,
  };
}

export function addStoryEntry(state, playerId, sentence) {
  if (state.status !== STORY_BUILDER_STATUS.PLAYING) {
    return {
      state,
      error: "The story is not accepting new contributions.",
    };
  }

  const player = getCurrentStoryPlayer(state);

  if (!player || player.id !== String(playerId)) {
    return {
      state,
      error: "It is not your turn to write.",
    };
  }

  const validation = validateStorySentence(sentence);

  if (!validation.valid) {
    return {
      state,
      error: validation.error,
    };
  }

  if (state.turnNumber >= state.maxTurns) {
    return {
      state,
      error: "The story has reached its turn limit.",
    };
  }

  const entry = {
    entryId: `entry-${state.turnNumber + 1}-${player.id}`,
    playerId: player.id,
    playerName: player.name,
    content: validation.content,
    turnNumber: state.turnNumber + 1,
    createdAt: Date.now(),
    isOpening: false,
  };

  const nextEntries = [...state.entries, entry];
  const nextTurnNumber = state.turnNumber + 1;
  const isFinished = nextTurnNumber >= state.maxTurns;

  const nextState = {
    ...state,
    entries: nextEntries,
    lastEntry: entry,
    turnNumber: nextTurnNumber,
    currentTurnIndex: isFinished
      ? state.currentTurnIndex
      : (state.currentTurnIndex + 1) % state.players.length,
    status: isFinished
      ? STORY_BUILDER_STATUS.FINISHED
      : STORY_BUILDER_STATUS.PLAYING,
    completedAt: isFinished ? Date.now() : null,
  };

  return {
    state: nextState,
    entry,
    error: null,
  };
}

export function finishStory(state) {
  if (state.status !== STORY_BUILDER_STATUS.PLAYING) return state;

  return {
    ...state,
    status: STORY_BUILDER_STATUS.FINISHED,
    completedAt: Date.now(),
  };
}

export function resetStory({
  players = [],
  prompt = SAMPLE_STORY_PROMPTS[0],
  maxTurns = STORY_BUILDER_CONFIG.DEFAULT_TURNS,
} = {}) {
  return createInitialStoryState({
    players,
    prompt,
    maxTurns,
  });
}

export function getStoryText(state) {
  return state.entries
    .map((entry) => entry.content)
    .join(" ");
}

export function getStoryWordCount(state) {
  const text = getStoryText(state).trim();

  return text ? text.split(/\s+/).length : 0;
}

export function getStoryProgress(state) {
  if (!state.maxTurns) return 0;

  return Math.min(
    100,
    Math.round((state.turnNumber / state.maxTurns) * 100)
  );
}
