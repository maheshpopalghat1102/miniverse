const MAX_CONTRIBUTION_LENGTH = 300;
const MIN_CONTRIBUTION_LENGTH = 2;

const cleanContribution = (value) => {
  if (typeof value !== "string") {
    throw new Error("Story contribution must be text.");
  }

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
};

export const createInitialState = (players, options = {}) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 6) {
    throw new Error("Story Builder requires 2–6 players.");
  }

  const maxRounds = Math.max(
    1,
    Math.min(Number(options.maxRounds) || 5, 20)
  );

  return {
    gameId: "story-builder",
    players: players.map(String),
    story: [],
    currentTurnIndex: 0,
    currentRound: 1,
    maxRounds,
    maxContributionLength: MAX_CONTRIBUTION_LENGTH,
    status: "playing",
    winner: null,
    completedAt: null,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") {
    throw new Error("Story Builder has ended.");
  }

  if (state.players[state.currentTurnIndex] !== id) {
    throw new Error("Not your turn.");
  }

  const contribution = cleanContribution(action.contribution);

  if (contribution.length < MIN_CONTRIBUTION_LENGTH) {
    throw new Error("Your contribution is too short.");
  }

  if (contribution.length > MAX_CONTRIBUTION_LENGTH) {
    throw new Error(
      `Your contribution cannot exceed ${MAX_CONTRIBUTION_LENGTH} characters.`
    );
  }

  const next = structuredClone(state);

  next.story.push({
    userId: id,
    contribution,
    round: next.currentRound,
    createdAt: new Date().toISOString(),
  });

  next.currentTurnIndex += 1;

  if (next.currentTurnIndex >= next.players.length) {
    next.currentTurnIndex = 0;
    next.currentRound += 1;

    if (next.currentRound > next.maxRounds) {
      next.status = "completed";
      next.completedAt = new Date().toISOString();
    }
  }

  return next;
};

export const getPublicState = (state) => {
  return structuredClone(state);
};

export const getCompleteStory = (state) => {
  return state.story
    .map((item) => item.contribution)
    .join(" ");
};

export const isFinished = (state) => state.status !== "playing";