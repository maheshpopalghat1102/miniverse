
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    type: {
      type: String,
      enum: [
        "friend_request",
        "friend_accepted",
        "game_invite",
        "room_invite",
        "match_result",
        "achievement",
        "system",
        "security"
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },

    message: {
      type: String,
      required: true,
      maxlength: 500
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    isRead: {
      type: Boolean,
      default: false
    },

    readAt: {
      type: Date,
      default: null
    },

    actionUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
