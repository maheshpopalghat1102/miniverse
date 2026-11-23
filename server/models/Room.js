
import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 5,
      maxlength: 10
    },

    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },

        role: {
          type: String,
          enum: ["host", "player", "spectator"],
          default: "player"
        },

        status: {
          type: String,
          enum: ["invited", "joined", "ready", "playing", "left"],
          default: "joined"
        },

        joinedAt: {
          type: Date,
          default: Date.now
        },

        isReady: {
          type: Boolean,
          default: false
        }
      }
    ],

    type: {
      type: String,
      enum: ["public", "private", "friends"],
      default: "public"
    },

    status: {
      type: String,
      enum: ["waiting", "starting", "playing", "completed", "closed"],
      default: "waiting"
    },

    maxPlayers: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },

    minPlayers: {
      type: Number,
      default: 2,
      min: 1
    },

    currentMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      default: null
    },

    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    passwordHash: {
      type: String,
      default: null,
      select: false
    },

    chatEnabled: {
      type: Boolean,
      default: true
    },

    allowSpectators: {
      type: Boolean,
      default: false
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 60 * 60 * 1000)
    },

    startedAt: {
      type: Date,
      default: null
    },

    closedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

roomSchema.index({ game: 1, type: 1, status: 1 });
roomSchema.index({ host: 1, status: 1 });
roomSchema.index({ "members.user": 1, status: 1 });

// Automatically delete expired temporary rooms.
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

roomSchema.pre("validate", function () {
  if (this.maxPlayers < this.minPlayers) {
    this.invalidate(
      "maxPlayers",
      "Maximum players cannot be less than minimum players."
    );
  }
});

const Room =
  mongoose.models.Room ||
  mongoose.model("Room", roomSchema);

export default Room;
