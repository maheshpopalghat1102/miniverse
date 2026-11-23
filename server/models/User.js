
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
      lowercase: true,
      match: /^[a-z0-9_]+$/
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    password: {
      type: String,
      required: true,
      select: false,
      minlength: 8
    },

    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user"
    },

    status: {
      type: String,
      enum: ["active", "suspended", "banned", "deleted"],
      default: "active"
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    emailVerifiedAt: {
      type: Date,
      default: null
    },

    avatar: {
      type: String,
      default: ""
    },

    lastLoginAt: {
      type: Date,
      default: null
    },

    lastActiveAt: {
      type: Date,
      default: null
    },

    loginAttempts: {
      type: Number,
      default: 0,
      min: 0
    },

    lockUntil: {
      type: Date,
      default: null
    },

    passwordChangedAt: {
      type: Date,
      default: null
    },

    deletionRequestedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ status: 1 });

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;
