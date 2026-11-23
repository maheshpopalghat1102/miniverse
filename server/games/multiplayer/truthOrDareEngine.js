import { randomInt } from "node:crypto";
import TruthDarePrompt from "../../models/TruthDarePrompt.js";

const VALID_TYPES = ["truth", "dare"];

export const createInitialState = (players, options = {}) => {
  if (!Array.isArray(players) || players.length < 2 || players.length > 10) {
    throw new Error("Truth or Dare requires 2–10 players.");
  }

  const categories = [
    "normal",
    "adult-18-plus",
    "private",
    "couples",
    "friends-party",
    "funny-crazy",
    "long-distance-couples",
  ];

  if (!categories.includes(options.category || "normal")) {
    throw new Error("Invalid Truth or Dare category.");
  }

  return {
    gameId: "truth-or-dare",
    players: players.map(String),
    category: options.category || "normal",
    language: options.language || "en",
    currentTurnIndex: 0,
    currentPrompt: null,
    usedPromptIds: [],
    history: [],
    status: "playing",
  };
};

export const getNextPrompt = async (state, userId, type, ageVerified = false) => {
  if (state.status !== "playing") throw new Error("Game has ended.");
  if (!state.players.includes(String(userId))) throw new Error("Not a player.");
  if (state.players[state.currentTurnIndex] !== String(userId)) {
    throw new Error("Not your turn.");
  }
  if (!VALID_TYPES.includes(type)) throw new Error("Choose truth or dare.");

  if (state.category === "adult-18-plus" && !ageVerified) {
    throw new Error("Verified adult access is required.");
  }

  const filter = {
    active: true,
    type,
    category: state.category,
    language: state.language,
  };

  if (state.usedPromptIds.length) {
    filter._id = { $nin: state.usedPromptIds };
  }

  const count = await TruthDarePrompt.countDocuments(filter);

  if (!count) throw new Error("No unused prompts remain in this category.");

  const offset = randomInt(count);

  const prompt = await TruthDarePrompt.findOne(filter)
    .skip(offset)
    .select("type category content difficulty ageRestricted");

  if (!prompt) throw new Error("Unable to select a prompt.");

  return {
    promptId: prompt._id.toString(),
    type: prompt.type,
    content: prompt.content,
    category: prompt.category,
    difficulty: prompt.difficulty,
    ageRestricted: prompt.ageRestricted,
  };
};

export const applyAction = (state, userId, action) => {
  const id = String(userId);

  if (state.status !== "playing") throw new Error("Game has ended.");
  if (state.players[state.currentTurnIndex] !== id) {
    throw new Error("Not your turn.");
  }

  if (!state.currentPrompt) {
    throw new Error("A prompt must be selected first.");
  }

  if (typeof action.completed !== "boolean") {
    throw new Error("Completion status is required.");
  }

  const next = structuredClone(state);

  next.history.push({
    userId: id,
    promptId: next.currentPrompt.promptId,
    type: next.currentPrompt.type,
    completed: action.completed,
  });

  next.usedPromptIds.push(next.currentPrompt.promptId);
  next.currentPrompt = null;
  next.currentTurnIndex = (next.currentTurnIndex + 1) % next.players.length;

  return next;
};

export const getPublicState = (state) => structuredClone(state);

export const isFinished = (state) => state.status !== "playing";