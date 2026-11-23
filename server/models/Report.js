
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    reportedRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null
    },

    reportedMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      default: null
    },

    category: {
      type: String,
      enum: [
        "harassment",
        "abuse",
        "cheating",
        "inappropriate_content",
        "spam",
        "fake_account",
        "other"
      ],
      required: true
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000
    },

    evidence: {
      type: [String],
      default: []
    },

    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "dismissed"],
      default: "pending"
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal"
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    resolution: {
      type: String,
      default: "",
      maxlength: 2000
    },

    resolvedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1, createdAt: -1 });

const Report =
  mongoose.models.Report ||
  mongoose.model("Report", reportSchema);

export default Report;
