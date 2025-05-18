const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [255, "Title cannot be more than 255 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    filePath: {
      type: String,
      required: [true, "File path is required"],
    },
    fileType: {
      type: String,
      required: [true, "File type is required"],
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster searches
DocumentSchema.index({ title: "text", description: "text", tags: "text" });

// Virtual for document URL
DocumentSchema.virtual("url").get(function () {
  return `/documents/${this._id}`;
});

// Virtual for file URL
DocumentSchema.virtual("fileUrl").get(function () {
  return `/uploads/${this.filePath?.split("/")?.pop()}`;
});

// Static method to find active documents
DocumentSchema.statics.findActive = function () {
  return this.find({ isDeleted: false });
};

// Static method to find documents by creator
DocumentSchema.statics.findByCreator = function (userId) {
  return this.find({ createdBy: userId, isDeleted: false });
};

const Document = mongoose.model("Document", DocumentSchema);

module.exports = Document;
