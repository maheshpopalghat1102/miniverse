
import mongoose from "mongoose";

const refreshSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false
    },

    familyId: {
      type: String,
      required: true
    },

    replacedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RefreshSession",
      default: null
    },

    userAgent: {
      type: String,
      default: "",
      maxlength: 500
    },

    ipAddress: {
      type: String,
      default: "",
      maxlength: 100
    },

    expiresAt: {
      type: Date,
      required: true
    },

    revokedAt: {
      type: Date,
      default: null
    },

    revokedReason: {
      type: String,
      enum: [
        "logout",
        "password_change",
        "token_rotation",
        "reuse_detected",
        "admin_action",
        "expired",
        null
      ],
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

refreshSessionSchema.index({ user: 1, revokedAt: 1 });
refreshSessionSchema.index({ familyId: 1 });
refreshSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const RefreshSession =
  mongoose.models.RefreshSession ||
  mongoose.model("RefreshSession", refreshSessionSchema);

export default RefreshSession;
