
import TruthDarePrompt from "../models/TruthDarePrompt.js";

import {
  getSeenPromptIds,
  getNextUnusedPrompt,
  recordPromptForUsers,
} from "./questionHistoryService.js";

const VALID_TYPES = ["truth", "dare"];

const VALID_CATEGORIES = [
  "normal",
  "adult-18-plus",
  "private",
  "couples",
  "friends-party",
  "funny-crazy",
  "long-distance",
  "long-distance-couples",
];

const normalizeCategory = (category) =>
  category === "long-distance-couples"
    ? "long-distance"
    : category;

const validateCategory = (category) => {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error("Invalid prompt category.");
  }

  if (category === "adult-18-plus") {
    throw new Error(
      "This category requires an approved age-verification system."
    );
  }

  return normalizeCategory(category);
};

export const getPrompts = async ({
  userId,
  type,
  category,
  language = "en",
  page = 1,
  limit = 20,
}) => {
  const filter = {
    isActive: true,
    ageRestricted: false,
    language: String(language || "en").trim().toLowerCase(),
  };

  if (type) {
    if (!VALID_TYPES.includes(type)) {
      throw new Error("Invalid prompt type.");
    }

    filter.type = type;
  }

  if (category) {
    filter.category = validateCategory(category);
  }

  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(
    Math.max(Number(limit) || 20, 1),
    50
  );

  if (userId) {
    const seenPromptIds = await getSeenPromptIds({
      userId,
      gameId: "truth-or-dare",
    });

    filter.promptId = {
      $nin: seenPromptIds,
    };
  }

  const total = await TruthDarePrompt.countDocuments(filter);

  const prompts = await TruthDarePrompt.find(filter)
    .select(
      "promptId type category content difficulty tags language"
    )
    .sort({ promptId: 1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  // Only record prompts when they are being delivered to a user.
  if (userId) {
    for (const prompt of prompts) {
      await recordPromptForUsers({
        userIds: [userId],
        prompt,
        gameId: "truth-or-dare",
      });
    }
  }

  return {
    prompts,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    },
  };
};

export const getRandomPrompt = async ({
  userId,
  type,
  category,
  language = "en",
}) => {
  if (!VALID_TYPES.includes(type)) {
    throw new Error("Invalid prompt type.");
  }

  const normalizedCategory = validateCategory(category);

  if (!userId) {
    throw new Error(
      "An authenticated user is required for persistent prompt history."
    );
  }

  return getNextUnusedPrompt({
    userId,
    type,
    category: normalizedCategory,
    language,
    gameId: "truth-or-dare",
    playerCount: 2,
  });
};

export const createPrompt = async (promptData) => {
  if (!VALID_TYPES.includes(promptData.type)) {
    throw new Error("Invalid prompt type.");
  }

  const category = validateCategory(promptData.category);

  return TruthDarePrompt.create({
    ...promptData,
    category,
    isActive: promptData.isActive ?? true,
  });
};

export const updatePrompt = async (promptId, updates = {}) => {
  const safeUpdates = { ...updates };

  if (safeUpdates.category) {
    safeUpdates.category = validateCategory(safeUpdates.category);
  }

  if (
    safeUpdates.type &&
    !VALID_TYPES.includes(safeUpdates.type)
  ) {
    throw new Error("Invalid prompt type.");
  }

  return TruthDarePrompt.findByIdAndUpdate(
    promptId,
    { $set: safeUpdates },
    { new: true, runValidators: true }
  );
};

export const deletePrompt = async (promptId) => {
  return TruthDarePrompt.findByIdAndDelete(promptId);
};
