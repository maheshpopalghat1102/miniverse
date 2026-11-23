
import mongoose from "mongoose";

const userQuestionHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    // History is isolated by game.
    // Truth or Dare uses "truth-or-dare".
    gameId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      immutable: true,
    },

    // Must match TruthDarePrompt.promptId.
    promptId: {
      type: String,
      required: true,
      trim: true,
      immutable: true,
    },

    category: {
      type: String,
      default: null,
      trim: true,
    },

    promptType: {
      type: String,
      enum: ["truth", "dare"],
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },

    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },

    seenAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// A user can see a prompt only once per game.
// This unique index also protects against simultaneous requests.
userQuestionHistorySchema.index(
  {
    userId: 1,
    gameId: 1,
    promptId: 1,
  },
  {
    unique: true,
    name: "unique_user_game_prompt",
  }
);

// Used when checking which prompts a user has already seen.
userQuestionHistorySchema.index({
  userId: 1,
  gameId: 1,
  seenAt: -1,
});

// Useful for filtering history by category.
userQuestionHistorySchema.index({
  userId: 1,
  gameId: 1,
  category: 1,
});

const UserQuestionHistory =
  mongoose.models.UserQuestionHistory ||
  mongoose.model("UserQuestionHistory", userQuestionHistorySchema);

export default UserQuestionHistory;
