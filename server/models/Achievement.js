
import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    achievementId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },

    description: {
      type: String,
      required: true,
      maxlength: 300
    },

    category: {
      type: String,
      enum: [
        "games",
        "wins",
        "social",
        "streaks",
        "special",
        "collection"
      ],
      required: true
    },

    icon: {
      type: String,
      default: ""
    },

    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      default: "common"
    },

    requirement: {
      type: {
        type: String,
        enum: [
          "games_played",
          "games_won",
          "total_score",
          "win_streak",
          "friends_count",
          "specific_game_wins",
          "custom"
        ],
        required: true
      },

      target: {
        type: Number,
        default: 1,
        min: 1
      },

      gameId: {
        type: String,
        default: null
      },

      metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    },

    reward: {
      points: {
        type: Number,
        default: 0,
        min: 0
      },

      experience: {
        type: Number,
        default: 0,
        min: 0
      }
    },

    isActive: {
      type: Boolean,
      default: true
    },

    sortOrder: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

achievementSchema.index({ category: 1, isActive: 1 });

const Achievement =
  mongoose.models.Achievement ||
  mongoose.model("Achievement", achievementSchema);

export default Achievement;
