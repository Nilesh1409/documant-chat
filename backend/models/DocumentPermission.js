const mongoose = require("mongoose")

const DocumentPermissionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Document ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    permissionType: {
      type: String,
      enum: ["read", "write", "admin"],
      default: "read",
      required: [true, "Permission type is required"],
    },
  },
  {
    timestamps: true,
  },
)

// Compound index for document and user
DocumentPermissionSchema.index({ documentId: 1, userId: 1 }, { unique: true })

// Static method to find user permissions
DocumentPermissionSchema.statics.findUserPermissions = function (userId) {
  return this.find({ userId }).populate("documentId")
}

// Static method to find document permissions
DocumentPermissionSchema.statics.findDocumentPermissions = function (documentId) {
  return this.find({ documentId }).populate("userId")
}

// Static method to check if user has specific permission
DocumentPermissionSchema.statics.hasPermission = async function (userId, documentId, requiredPermission) {
  const permission = await this.findOne({ userId, documentId })

  if (!permission) return false

  const permissionLevels = {
    read: 1,
    write: 2,
    admin: 3,
  }

  return permissionLevels[permission.permissionType] >= permissionLevels[requiredPermission]
}

const DocumentPermission = mongoose.model("DocumentPermission", DocumentPermissionSchema)

module.exports = DocumentPermission
