const mongoose = require("mongoose")

const IngestionJobSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: [true, "Document ID is required"],
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
  errorMessage: {
    type: String,
  },
})

// Index for status-based queries
IngestionJobSchema.index({ status: 1 })

// Static method to find pending jobs
IngestionJobSchema.statics.findPendingJobs = function () {
  return this.find({ status: "pending" }).sort({ startedAt: 1 })
}

// Static method to find jobs by document
IngestionJobSchema.statics.findByDocument = function (documentId) {
  return this.find({ documentId }).sort({ startedAt: -1 })
}

const IngestionJob = mongoose.model("IngestionJob", IngestionJobSchema)

module.exports = IngestionJob
