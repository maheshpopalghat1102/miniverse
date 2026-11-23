
import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    gameId: {
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

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    description: {
      type: String,
      default: "",
      maxlength: 500
    },

    category: {
      type: String,
      enum: ["multiplayer", "single-player", "turn-by-turn"],
      required: true
    },

    minPlayers: {
      type: Number,
      required: true,
      min: 1
    },

    maxPlayers: {
      type: Number,
      required: true,
      min: 1
    },

    modes: {
      type: [String],
      default: []
    },

    thumbnail: {
      type: String,
      default: ""
    },

    banner: {
      type: String,
      default: ""
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "variable"],
      default: "easy"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    sortOrder: {
      type: Number,
      default: 0
    },

    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

gameSchema.index({ category: 1, isActive: 1, sortOrder: 1 });

gameSchema.pre("validate", function () {
  if (this.maxPlayers < this.minPlayers) {
    this.invalidate(
      "maxPlayers",
      "Maximum players cannot be less than minimum players."
    );
  }
});

const Game =
  mongoose.models.Game ||
  mongoose.model("Game", gameSchema);

export default Game;
