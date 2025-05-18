const Document = require("../models/Document");
const DocumentVersion = require("../models/DocumentVersion");
const DocumentPermission = require("../models/DocumentPermission");
const IngestionJob = require("../models/IngestionJob");
const {
  apiSuccess,
  apiCreated,
  apiUpdated,
  apiDeleted,
  apiNotFound,
  apiBadRequest,
  apiForbidden,
  apiError,
} = require("../utils/apiResponse");
const fs = require("fs");
const path = require("path");

/**
 * @desc    Get all documents
 * @route   GET /api/documents
 * @access  Private
 */
exports.getDocuments = async (req, res) => {
  // Pagination
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Query parameters
  const filter = { isDeleted: false };

  // If not admin, only show documents created by user or shared with user
  if (req.user.role !== "admin") {
    const permissionDocIds = await DocumentPermission.find({
      userId: req.user._id,
    }).distinct("documentId");

    filter.$or = [
      { createdBy: req.user._id },
      { _id: { $in: permissionDocIds } },
    ];
  }

  // Search by title, description, or tags
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Filter by tags
  if (req.query.tags) {
    const tags = req.query.tags.split(",").map((tag) => tag.trim());
    filter.tags = { $in: tags };
  }

  // Execute query
  const documents = await Document.find(filter)
    .populate("createdBy", "firstName lastName email")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count
  const total = await Document.countDocuments(filter);

  return apiSuccess(res, {
    documents,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

/**
 * @desc    Get document by ID
 * @route   GET /api/documents/:id
 * @access  Private
 */
exports.getDocumentById = async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    isDeleted: false,
  }).populate("createdBy", "firstName lastName email");

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Check if user has permission to view this document
  if (
    req.user.role !== "admin" &&
    document.createdBy._id.toString() !== req.user._id.toString()
  ) {
    const hasPermission = await DocumentPermission.hasPermission(
      req.user._id,
      document._id,
      "read"
    );

    if (!hasPermission) {
      return apiForbidden(
        res,
        "You do not have permission to view this document"
      );
    }
  }

  // Get latest version
  const latestVersion = await DocumentVersion.findLatestVersion(document._id);

  return apiSuccess(res, {
    document,
    latestVersion,
  });
};

/**
 * @desc    Create a new document
 * @route   POST /api/documents
 * @access  Private
 */
exports.createDocument = async (req, res) => {
  if (!req.file) {
    return apiBadRequest(res, "Please upload a file");
  }

  const { title, description, tags } = req.body;
  console.log("🚀 ~ exports.createDocument= ~ tags:", tags);
  const file = req.file;

  // Create document
  const document = await Document.create({
    title,
    description,
    filePath: file.path,
    fileType: file.mimetype,
    fileSize: file.size,
    createdBy: req.user._id,
    tags: tags ? JSON.parse(tags) : [],
  });

  // Create initial version
  const version = await DocumentVersion.create({
    documentId: document._id,
    versionNumber: 1,
    filePath: file.path,
    createdBy: req.user._id,
    changeSummary: "Initial version",
  });

  // Create ingestion job
  await IngestionJob.create({
    documentId: document._id,
    status: "pending",
  });

  return apiCreated(
    res,
    {
      document,
      version,
    },
    "Document created successfully"
  );
};

/**
 * @desc    Update document
 * @route   PUT /api/documents/:id
 * @access  Private
 */
exports.updateDocument = async (req, res) => {
  const { title, description, tags } = req.body;

  // Find document
  const document = await Document.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Update fields
  if (title !== undefined) document.title = title;
  if (description !== undefined) document.description = description;
  if (tags !== undefined) document.tags = JSON.parse(tags);

  // Save document
  await document.save();

  return apiUpdated(res, document, "Document updated successfully");
};

/**
 * @desc    Upload new document version
 * @route   POST /api/documents/:id/versions
 * @access  Private
 */
exports.uploadVersion = async (req, res) => {
  if (!req.file) {
    return apiBadRequest(res, "Please upload a file");
  }

  const { changeSummary } = req.body;
  const file = req.file;

  // Find document
  const document = await Document.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Get latest version number
  const latestVersion = await DocumentVersion.findLatestVersion(document._id);
  const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

  // Create new version
  const version = await DocumentVersion.create({
    documentId: document._id,
    versionNumber,
    filePath: file.path,
    createdBy: req.user._id,
    changeSummary,
  });

  // Update document file info
  document.filePath = file.path;
  document.fileType = file.mimetype;
  document.fileSize = file.size;
  await document.save();

  // Create ingestion job
  await IngestionJob.create({
    documentId: document._id,
    status: "pending",
  });

  return apiCreated(res, version, "New version uploaded successfully");
};

/**
 * @desc    Get document versions
 * @route   GET /api/documents/:id/versions
 * @access  Private
 */
exports.getDocumentVersions = async (req, res) => {
  // Find document
  const document = await Document.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Get versions
  const versions = await DocumentVersion.find({ documentId: document._id })
    .populate("createdBy", "firstName lastName email")
    .sort({ versionNumber: -1 });

  return apiSuccess(res, versions);
};

/**
 * @desc    Get specific document version
 * @route   GET /api/documents/:id/versions/:versionNumber
 * @access  Private
 */
exports.getDocumentVersion = async (req, res) => {
  const { id, versionNumber } = req.params;

  // Find document
  const document = await Document.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Get version
  const version = await DocumentVersion.findOne({
    documentId: id,
    versionNumber: Number.parseInt(versionNumber, 10),
  }).populate("createdBy", "firstName lastName email");

  if (!version) {
    return apiNotFound(res, "Version not found");
  }

  return apiSuccess(res, version);
};

/**
 * @desc    Download document file
 * @route   GET /api/documents/:id/download
 * @access  Private
 */
exports.downloadDocument = async (req, res) => {
  try {
    // Find document
    const document = await Document.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!document) {
      return apiNotFound(res, "Document not found");
    }

    // Check if user has permission to download this document
    if (
      req.user.role !== "admin" &&
      document.createdBy.toString() !== req.user._id.toString()
    ) {
      const hasPermission = await DocumentPermission.hasPermission(
        req.user._id,
        document._id,
        "read"
      );

      if (!hasPermission) {
        return apiForbidden(
          res,
          "You do not have permission to download this document"
        );
      }
    }

    // Get file path
    const filePath = document.filePath;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return apiNotFound(res, "Document file not found");
    }

    // Get filename from path
    const filename = path.basename(filePath);

    // Set headers for file download
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", document.fileType);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on("error", (error) => {
      console.error(`Error streaming file: ${error}`);
      if (!res.headersSent) {
        return apiError(res, "Error downloading file", 500);
      }
    });
  } catch (error) {
    console.error(`Error downloading document: ${error}`);
    return apiError(res, "Error downloading document", 500);
  }
};

/**
 * @desc    Download specific document version
 * @route   GET /api/documents/:id/versions/:versionNumber/download
 * @access  Private
 */
exports.downloadDocumentVersion = async (req, res) => {
  try {
    const { id, versionNumber } = req.params;

    // Find document
    const document = await Document.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!document) {
      return apiNotFound(res, "Document not found");
    }

    // Check if user has permission to download this document
    if (
      req.user.role !== "admin" &&
      document.createdBy.toString() !== req.user._id.toString()
    ) {
      const hasPermission = await DocumentPermission.hasPermission(
        req.user._id,
        document._id,
        "read"
      );

      if (!hasPermission) {
        return apiForbidden(
          res,
          "You do not have permission to download this document"
        );
      }
    }

    // Get version
    const version = await DocumentVersion.findOne({
      documentId: id,
      versionNumber: Number.parseInt(versionNumber, 10),
    });

    if (!version) {
      return apiNotFound(res, "Version not found");
    }

    // Get file path
    const filePath = version.filePath;

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return apiNotFound(res, "Document file not found");
    }

    // Get filename from path
    const filename = path.basename(filePath);

    // Set headers for file download
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", document.fileType);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on("error", (error) => {
      console.error(`Error streaming file: ${error}`);
      if (!res.headersSent) {
        return apiError(res, "Error downloading file", 500);
      }
    });
  } catch (error) {
    console.error(`Error downloading document version: ${error}`);
    return apiError(res, "Error downloading document version", 500);
  }
};

/**
 * @desc    Delete document (soft delete)
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
exports.deleteDocument = async (req, res) => {
  // Find document
  const document = await Document.findById(req.params.id);

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Soft delete
  document.isDeleted = true;
  await document.save();

  return apiDeleted(res, "Document deleted successfully");
};

/**
 * @desc    Hard delete document and all related data
 * @route   DELETE /api/documents/:id/permanent
 * @access  Private/Admin
 */
exports.permanentDeleteDocument = async (req, res) => {
  // Find document
  const document = await Document.findById(req.params.id);

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Get all versions
  const versions = await DocumentVersion.find({ documentId: document._id });

  // Delete all files
  const filesToDelete = [document.filePath, ...versions.map((v) => v.filePath)];

  for (const filePath of filesToDelete) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }

  // Delete all related data
  await DocumentVersion.deleteMany({ documentId: document._id });
  await DocumentPermission.deleteMany({ documentId: document._id });
  await IngestionJob.deleteMany({ documentId: document._id });

  // Delete document
  await document.deleteOne();

  return apiDeleted(res, "Document permanently deleted");
};

/**
 * @desc    Get document permissions
 * @route   GET /api/documents/:id/permissions
 * @access  Private
 */
exports.getDocumentPermissions = async (req, res) => {
  // Find document
  const document = await Document.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Get permissions
  const permissions = await DocumentPermission.find({
    documentId: document._id,
  }).populate("userId", "firstName lastName email role");

  return apiSuccess(res, permissions);
};

/**
 * @desc    Add document permission
 * @route   POST /api/documents/:id/permissions
 * @access  Private
 */
exports.addDocumentPermission = async (req, res) => {
  const { userId, permissionType } = req.body;

  // Find document
  const document = await Document.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Check if permission already exists
  const existingPermission = await DocumentPermission.findOne({
    documentId: document._id,
    userId,
  });

  if (existingPermission) {
    // Update existing permission
    existingPermission.permissionType = permissionType;
    await existingPermission.save();

    return apiUpdated(
      res,
      existingPermission,
      "Permission updated successfully"
    );
  }

  // Create new permission
  const permission = await DocumentPermission.create({
    documentId: document._id,
    userId,
    permissionType,
  });

  return apiCreated(res, permission, "Permission added successfully");
};

/**
 * @desc    Remove document permission
 * @route   DELETE /api/documents/:id/permissions/:permissionId
 * @access  Private
 */
exports.removeDocumentPermission = async (req, res) => {
  // Find document
  const document = await Document.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Find and delete permission
  const permission = await DocumentPermission.findOneAndDelete({
    _id: req.params.permissionId,
    documentId: document._id,
  });

  if (!permission) {
    return apiNotFound(res, "Permission not found");
  }

  return apiDeleted(res, "Permission removed successfully");
};
