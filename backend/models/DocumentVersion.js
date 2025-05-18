const mongoose = require("mongoose")

const DocumentVersionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Document ID is required"],
    },
    versionNumber: {
      type: Number,
      required: [true, "Version number is required"],
    },
    filePath: {
      type: String,
      required: [true, "File path is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    changeSummary: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Compound index for document and version
DocumentVersionSchema.index({ documentId: 1, versionNumber: 1 }, { unique: true })

// Virtual for file URL
DocumentVersionSchema.virtual("fileUrl").get(function () {
  return `/uploads/${this.filePath.split("/").pop()}`
})

// Static method to find latest version
DocumentVersionSchema.statics.findLatestVersion = function (documentId) {
  return this.findOne({ documentId }).sort({ versionNumber: -1 }).limit(1)
}

// Static method to find all versions of a document
DocumentVersionSchema.statics.findAllVersions = function (documentId) {
  return this.find({ documentId }).sort({ versionNumber: 1 })
}

const DocumentVersion = mongoose.model("DocumentVersion", DocumentVersionSchema)

module.exports = DocumentVersion
