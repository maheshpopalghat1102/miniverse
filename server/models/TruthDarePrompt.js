
import mongoose from "mongoose";

const truthDarePromptSchema = new mongoose.Schema(
  {
    promptId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["truth", "dare"],
      required: true
    },

    category: {
      type: String,
      enum: [
        "normal",
        "adult-18-plus",
        "private",
        "couples",
        "friends-party",
        "funny-crazy",
        "long-distance"
      ],
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000
    },

    language: {
      type: String,
      default: "en",
      lowercase: true
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy"
    },

    ageRestricted: {
      type: Boolean,
      default: false
    },

    minPlayers: {
      type: Number,
      default: 2,
      min: 1
    },

    maxPlayers: {
      type: Number,
      default: null,
      min: 1
    },

    tags: {
      type: [String],
      default: []
    },

    isActive: {
      type: Boolean,
      default: true
    },

    usageCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

truthDarePromptSchema.index({
  category: 1,
  type: 1,
  language: 1,
  isActive: 1
});

truthDarePromptSchema.index({
  category: 1,
  difficulty: 1
});

const TruthDarePrompt =
  mongoose.models.TruthDarePrompt ||
  mongoose.model("TruthDarePrompt", truthDarePromptSchema);

export default TruthDarePrompt;
