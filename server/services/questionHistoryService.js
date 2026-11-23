
import mongoose from "mongoose";

import UserQuestionHistory from "../models/UserQuestionHistory.js";
import TruthDarePrompt from "../models/TruthDarePrompt.js";

const TRUTH_DARE_GAME_ID = "truth-or-dare";
const MAX_SELECTION_ATTEMPTS = 8;

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

const toObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid user ID.");
  }

  return new mongoose.Types.ObjectId(id);
};

const normalizeUserIds = (userIds = []) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error("At least one player is required.");
  }

  const ids = [
    ...new Set(userIds.map((id) => String(id))),
  ];

  return ids.map(toObjectId);
};

const validateSelection = ({
  category,
  type,
  language = "en",
}) => {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error("Invalid Truth or Dare category.");
  }

  if (!VALID_TYPES.includes(type)) {
    throw new Error("Prompt type must be truth or dare.");
  }

  if (category === "adult-18-plus") {
    throw new Error(
      "This category requires an approved age-verification system."
    );
  }

  const normalizedLanguage = String(language || "en")
    .trim()
    .toLowerCase();

  if (!/^[a-z]{2,10}(-[a-z0-9]{2,10})?$/.test(normalizedLanguage)) {
    throw new Error("Invalid prompt language.");
  }

  return {
    category: normalizeCategory(category),
    type,
    language: normalizedLanguage,
  };
};

export const getSeenPromptIds = async ({
  userId,
  gameId = TRUTH_DARE_GAME_ID,
}) => {
  const objectUserId = toObjectId(userId);

  return UserQuestionHistory.distinct("promptId", {
    userId: objectUserId,
    gameId,
  });
};

/**
 * Record a prompt for every participant in one transaction.
 * If any participant has already seen it, the transaction
 * fails without leaving partial history records.
 */
export const recordPromptForUsers = async ({
  userIds,
  prompt,
  gameId = TRUTH_DARE_GAME_ID,
  roomId = null,
  matchId = null,
}) => {
  if (!prompt?.promptId || !VALID_TYPES.includes(prompt.type)) {
    throw new Error("A valid Truth or Dare prompt is required.");
  }

  const objectUserIds = normalizeUserIds(userIds);
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const documents = objectUserIds.map((userId) => ({
        userId,
        gameId,
        promptId: prompt.promptId,
        category: prompt.category || null,
        promptType: prompt.type,
        roomId:
          roomId && mongoose.Types.ObjectId.isValid(roomId)
            ? roomId
            : null,
        matchId:
          matchId && mongoose.Types.ObjectId.isValid(matchId)
            ? matchId
            : null,
      }));

      await UserQuestionHistory.insertMany(documents, {
        session,
        ordered: true,
      });

      await TruthDarePrompt.updateOne(
        { promptId: prompt.promptId },
        { $inc: { usageCount: 1 } },
        { session }
      );
    });

    return true;
  } catch (error) {
    if (error?.code === 11000) {
      throw new Error(
        "This prompt has already been seen by at least one player."
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * Select a prompt that none of the supplied users has seen,
 * then record it for all of them before returning it.
 */
export const selectAndRecordPromptForUsers = async ({
  userIds,
  category,
  type,
  language = "en",
  gameId = TRUTH_DARE_GAME_ID,
  roomId = null,
  matchId = null,
  playerCount,
}) => {
  const objectUserIds = normalizeUserIds(userIds);

  const selection = validateSelection({
    category,
    type,
    language,
  });

  const effectivePlayerCount = Math.max(
    1,
    Number(playerCount) || objectUserIds.length || 2
  );

  const promptFilter = {
    category: selection.category,
    type: selection.type,
    language: selection.language,
    isActive: true,
    ageRestricted: false,
    minPlayers: { $lte: effectivePlayerCount },
    $or: [
      { maxPlayers: null },
      { maxPlayers: { $gte: effectivePlayerCount } },
    ],
  };

  for (
    let attempt = 0;
    attempt < MAX_SELECTION_ATTEMPTS;
    attempt += 1
  ) {
    const seenPromptIds = await UserQuestionHistory.distinct(
      "promptId",
      {
        userId: { $in: objectUserIds },
        gameId,
      }
    );

    const [prompt] = await TruthDarePrompt.aggregate([
      {
        $match: {
          ...promptFilter,
          promptId: { $nin: seenPromptIds },
        },
      },
      { $sample: { size: 1 } },
      {
        $project: {
          _id: 1,
          promptId: 1,
          type: 1,
          category: 1,
          content: 1,
          difficulty: 1,
          language: 1,
        },
      },
    ]);

    if (!prompt) {
      return {
        prompt: null,
        exhausted: true,
      };
    }

    try {
      await recordPromptForUsers({
        userIds: objectUserIds,
        prompt,
        gameId,
        roomId,
        matchId,
      });

      return {
        prompt,
        exhausted: false,
      };
    } catch (error) {
      // Another request may have reserved this prompt
      // after selection but before the history insert.
      if (error.message.includes("already been seen")) {
        continue;
      }

      throw error;
    }
  }

  return {
    prompt: null,
    exhausted: false,
    retry: true,
  };
};

export const getNextUnusedPrompt = async ({
  userId,
  category,
  type,
  language = "en",
  gameId = TRUTH_DARE_GAME_ID,
  roomId = null,
  matchId = null,
  playerCount = 2,
}) => {
  const result = await selectAndRecordPromptForUsers({
    userIds: [userId],
    category,
    type,
    language,
    gameId,
    roomId,
    matchId,
    playerCount,
  });

  return result.prompt;
};

export const getAvailablePromptCount = async ({
  userId,
  category,
  type,
  language = "en",
  gameId = TRUTH_DARE_GAME_ID,
  playerCount = 2,
}) => {
  const objectUserId = toObjectId(userId);

  const selection = validateSelection({
    category,
    type,
    language,
  });

  const seenPromptIds = await getSeenPromptIds({
    userId: objectUserId,
    gameId,
  });

  return TruthDarePrompt.countDocuments({
    category: selection.category,
    type: selection.type,
    language: selection.language,
    isActive: true,
    ageRestricted: false,
    minPlayers: { $lte: playerCount },
    $or: [
      { maxPlayers: null },
      { maxPlayers: { $gte: playerCount } },
    ],
    promptId: { $nin: seenPromptIds },
  });
};

export const getQuestionHistorySummary = async ({
  userId,
  gameId = TRUTH_DARE_GAME_ID,
}) => {
  const objectUserId = toObjectId(userId);

  const [seenCount, latest] = await Promise.all([
    UserQuestionHistory.countDocuments({
      userId: objectUserId,
      gameId,
    }),

    UserQuestionHistory.findOne({
      userId: objectUserId,
      gameId,
    })
      .sort({ seenAt: -1 })
      .select("seenAt")
      .lean(),
  ]);

  return {
    gameId,
    seenCount,
    latestSeenAt: latest?.seenAt || null,
  };
};

export const resetUserQuestionHistory = async ({
  userId,
  gameId = TRUTH_DARE_GAME_ID,
}) => {
  const objectUserId = toObjectId(userId);

  const result = await UserQuestionHistory.deleteMany({
    userId: objectUserId,
    gameId,
  });

  return {
    deletedCount: result.deletedCount || 0,
    gameId,
  };
};
