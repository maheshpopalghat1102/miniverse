
import mongoose from "mongoose";

const friendshipSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending"
    },

    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    acceptedAt: {
      type: Date,
      default: null
    },

    blockedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

friendshipSchema.index(
  { requester: 1, recipient: 1 },
  { unique: true }
);

friendshipSchema.index({ recipient: 1, status: 1 });
friendshipSchema.index({ requester: 1, status: 1 });

friendshipSchema.pre("validate", function () {
  if (
    this.requester &&
    this.recipient &&
    this.requester.equals(this.recipient)
  ) {
    this.invalidate(
      "recipient",
      "A user cannot send a friend request to themselves."
    );
  }
});

const Friendship =
  mongoose.models.Friendship ||
  mongoose.model("Friendship", friendshipSchema);

export default Friendship;
