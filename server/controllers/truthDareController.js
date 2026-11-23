
import TruthDarePrompt from "../models/TruthDarePrompt.js";

import {
  getSeenPromptIds,
  getNextUnusedPrompt,
  recordPromptForUsers,
  resetUserQuestionHistory,
} from "../services/questionHistoryService.js";

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

const getUserId = (req) =>
  req.user?.id || req.user?._id;

const rejectAdultCategory = (res) =>
  res.status(403).json({
    success: false,
    message:
      "This category requires an approved age-verification system.",
  });

export const getPrompts = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const {
      category: requestedCategory,
      type,
      difficulty,
      language = "en",
      limit = 10,
    } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!VALID_CATEGORIES.includes(requestedCategory)) {
      return res.status(400).json({
        success: false,
        message: "A valid Truth or Dare category is required.",
      });
    }

    if (!["truth", "dare"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be truth or dare.",
      });
    }

    if (requestedCategory === "adult-18-plus") {
      return rejectAdultCategory(res);
    }

    if (
      difficulty &&
      !["easy", "medium", "hard"].includes(difficulty)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty.",
      });
    }

    const batchSize = Math.min(
      20,
      Math.max(1, Number(limit) || 10)
    );

    const category = normalizeCategory(requestedCategory);
    const seenPromptIds = await getSeenPromptIds({ userId });

    const filter = {
      category,
      type,
      language: String(language).trim().toLowerCase(),
      isActive: true,
      ageRestricted: false,
      promptId: { $nin: seenPromptIds },
    };

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // Do not use skip/page here. Returned prompts are recorded
    // as seen, so the next request naturally returns the next
    // unseen prompts.
    const prompts = await TruthDarePrompt.find(filter)
      .select(
        "promptId type category content difficulty tags language"
      )
      .sort({ promptId: 1 })
      .limit(batchSize)
      .lean();

    // Record each prompt before sending it to the client.
    for (const prompt of prompts) {
      await recordPromptForUsers({
        userIds: [userId],
        prompt,
      });
    }

    const updatedSeenPromptIds = await getSeenPromptIds({
      userId,
    });

    const remaining = await TruthDarePrompt.countDocuments({
      ...filter,
      promptId: { $nin: updatedSeenPromptIds },
    });

    return res.status(200).json({
      success: true,
      category: requestedCategory,
      type,
      limit: batchSize,
      count: prompts.length,
      remaining,
      exhausted: prompts.length === 0,
      prompts,
    });
  } catch (error) {
    next(error);
  }
};

export const getRandomPrompt = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const {
      category,
      type,
      language = "en",
    } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      !VALID_CATEGORIES.includes(category) ||
      !["truth", "dare"].includes(type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid category and type are required.",
      });
    }

    if (category === "adult-18-plus") {
      return rejectAdultCategory(res);
    }

    const prompt = await getNextUnusedPrompt({
      userId,
      category,
      type,
      language,
      playerCount: 2,
    });

    if (!prompt) {
      return res.status(404).json({
        success: false,
        exhausted: true,
        message:
          "You have seen all available prompts for this category and type.",
      });
    }

    return res.status(200).json({
      success: true,
      exhausted: false,
      prompt,
    });
  } catch (error) {
    next(error);
  }
};

export const resetQuestionHistory = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const result = await resetUserQuestionHistory({
      userId,
      gameId: "truth-or-dare",
    });

    return res.status(200).json({
      success: true,
      message: "Your Truth or Dare question history has been reset.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN ONLY: add a prompt.
export const createPrompt = async (req, res, next) => {
  try {
    const promptData = {
      ...req.body,
      category: normalizeCategory(req.body.category),
      isActive: req.body.isActive ?? true,
    };

    if (
      !VALID_CATEGORIES.includes(req.body.category) ||
      !["truth", "dare"].includes(req.body.type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category or prompt type.",
      });
    }

    if (promptData.category === "adult-18-plus") {
      return res.status(403).json({
        success: false,
        message:
          "Adult prompts cannot be added until an approved age-verification system is implemented.",
      });
    }

    const prompt = await TruthDarePrompt.create(promptData);

    return res.status(201).json({
      success: true,
      message: "Prompt created.",
      prompt,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN ONLY: update a prompt.
export const updatePrompt = async (req, res, next) => {
  try {
    const allowedFields = [
      "content",
      "category",
      "type",
      "difficulty",
      "ageRestricted",
      "minPlayers",
      "maxPlayers",
      "tags",
      "isActive",
      "language",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] =
          field === "category"
            ? normalizeCategory(req.body[field])
            : req.body[field];
      }
    }

    if (
      updates.category &&
      !VALID_CATEGORIES.includes(req.body.category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid prompt category.",
      });
    }

    if (updates.category === "adult-18-plus") {
      return res.status(403).json({
        success: false,
        message:
          "Adult prompts cannot be enabled until an approved age-verification system is implemented.",
      });
    }

    if (
      updates.type &&
      !["truth", "dare"].includes(updates.type)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid prompt type.",
      });
    }

    const prompt = await TruthDarePrompt.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: "Prompt not found.",
      });
    }

    return res.status(200).json({
      success: true,
      prompt,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN ONLY: permanently remove an invalid prompt.
export const deletePrompt = async (req, res, next) => {
  try {
    const prompt = await TruthDarePrompt.findByIdAndDelete(
      req.params.id
    );

    if (!prompt) {
      return res.status(404).json({
        success: false,
        message: "Prompt not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prompt deleted.",
    });
  } catch (error) {
    next(error);
  }
};
