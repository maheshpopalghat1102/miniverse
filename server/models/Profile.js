
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    displayName: {
      type: String,
      trim: true,
      maxlength: 40,
      default: ""
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 250,
      default: ""
    },

    avatar: {
      type: String,
      default: ""
    },

    coverImage: {
      type: String,
      default: ""
    },

    country: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },

    dateOfBirth: {
      type: Date,
      default: null,
      select: false
    },

    interests: {
      type: [String],
      default: []
    },

    favoriteGames: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Game"
      }
    ],

    theme: {
      type: String,
      enum: [
        "midnight",
        "amoled",
        "ocean",
        "sunset",
        "sakura",
        "emerald",
        "light",
        "cyberpunk"
      ],
      default: "midnight"
    },

    language: {
      type: String,
      default: "en"
    },

    statistics: {
      gamesPlayed: {
        type: Number,
        default: 0,
        min: 0
      },

      gamesWon: {
        type: Number,
        default: 0,
        min: 0
      },

      gamesLost: {
        type: Number,
        default: 0,
        min: 0
      },

      totalScore: {
        type: Number,
        default: 0,
        min: 0
      },

      totalPlayTime: {
        type: Number,
        default: 0,
        min: 0
      },

      currentStreak: {
        type: Number,
        default: 0,
        min: 0
      },

      bestStreak: {
        type: Number,
        default: 0,
        min: 0
      }
    },

    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public"
      },

      showOnlineStatus: {
        type: Boolean,
        default: true
      },

      showGameHistory: {
        type: Boolean,
        default: true
      },

      allowFriendRequests: {
        type: Boolean,
        default: true
      }
    },

    notifications: {
      gameInvites: { type: Boolean, default: true },
      friendRequests: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

profileSchema.index({ "statistics.totalScore": -1 });
profileSchema.index({ "statistics.gamesWon": -1 });

const Profile =
  mongoose.models.Profile ||
  mongoose.model("Profile", profileSchema);

export default Profile;

