
import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null
    },

    matchCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },

    players: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },

        username: {
          type: String,
          default: ""
        },

        team: {
          type: String,
          default: null
        },

        finalScore: {
          type: Number,
          default: 0
        },

        result: {
          type: String,
          enum: ["win", "loss", "draw", "participated"],
          default: "participated"
        },

        position: {
          type: Number,
          default: null
        }
      }
    ],

    status: {
      type: String,
      enum: ["waiting", "active", "completed", "cancelled"],
      default: "waiting"
    },

    gameMode: {
      type: String,
      enum: ["public", "private", "local", "solo"],
      default: "public"
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    isDraw: {
      type: Boolean,
      default: false
    },

    startedAt: {
      type: Date,
      default: null
    },

    endedAt: {
      type: Date,
      default: null
    },

    durationSeconds: {
      type: Number,
      default: 0,
      min: 0
    },

    finalState: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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

matchSchema.index({ game: 1, status: 1, createdAt: -1 });
matchSchema.index({ "players.user": 1, createdAt: -1 });
matchSchema.index({ status: 1, endedAt: -1 });

const Match =
  mongoose.models.Match ||
  mongoose.model("Match", matchSchema);

export default Match;
