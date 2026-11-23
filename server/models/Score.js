
import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true
    },

    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true
    },

    score: {
      type: Number,
      required: true,
      min: 0
    },

    bonusScore: {
      type: Number,
      default: 0,
      min: 0
    },

    rank: {
      type: Number,
      default: null,
      min: 1
    },

    result: {
      type: String,
      enum: ["win", "loss", "draw", "participated"],
      default: "participated"
    },

    durationSeconds: {
      type: Number,
      default: 0,
      min: 0
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

scoreSchema.index({ user: 1, createdAt: -1 });
scoreSchema.index({ game: 1, score: -1 });
scoreSchema.index({ match: 1, user: 1 }, { unique: true });

const Score =
  mongoose.models.Score ||
  mongoose.model("Score", scoreSchema);

export default Score;
