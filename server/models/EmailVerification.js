
import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    tokenHash: {
      type: String,
      required: true,
      select: false
    },

    purpose: {
      type: String,
      enum: ["email_verification", "password_reset"],
      required: true
    },

    expiresAt: {
      type: Date,
      required: true
    },

    usedAt: {
      type: Date,
      default: null
    },

    attempts: {
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

emailVerificationSchema.index({
  user: 1,
  purpose: 1,
  createdAt: -1
});

emailVerificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

const EmailVerification =
  mongoose.models.EmailVerification ||
  mongoose.model("EmailVerification", emailVerificationSchema);

export default EmailVerification;
