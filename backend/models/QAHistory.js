const mongoose = require("mongoose");

const QAHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
    confidence: {
      type: String,
      enum: ["high", "medium", "low", "none"],
      default: "none",
    },
    sources: [
      {
        documentId: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        excerpts: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
QAHistorySchema.index({ userId: 1, createdAt: -1 });

const QAHistory = mongoose.model("QAHistory", QAHistorySchema);

module.exports = QAHistory;
