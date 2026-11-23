
import mongoose from "mongoose";

const userAchievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Achievement",
      required: true
    },

    progress: {
      type: Number,
      default: 0,
      min: 0
    },

    target: {
      type: Number,
      required: true,
      min: 1
    },

    isUnlocked: {
      type: Boolean,
      default: false
    },

    unlockedAt: {
      type: Date,
      default: null
    },

    claimedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userAchievementSchema.index(
  { user: 1, achievement: 1 },
  { unique: true }
);

userAchievementSchema.index({ user: 1, isUnlocked: 1 });

const UserAchievement =
  mongoose.models.UserAchievement ||
  mongoose.model("UserAchievement", userAchievementSchema);

export default UserAchievement;
