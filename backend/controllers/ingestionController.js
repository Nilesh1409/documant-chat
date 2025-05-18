const IngestionJob = require("../models/IngestionJob");
const Document = require("../models/Document");
const { apiSuccess, apiUpdated, apiNotFound } = require("../utils/apiResponse");

/**
 * @desc    Get all ingestion jobs
 * @route   GET /api/ingestion
 * @access  Private/Admin
 */
exports.getIngestionJobs = async (req, res) => {
  // Pagination
  const page = Number.parseInt(req.query.page, 10) || 1;
  const limit = Number.parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Query parameters
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.documentId) filter.documentId = req.query.documentId;
  console.log("🚀 ~ exports.getIngestionJobs= ~ filter:", filter);

  // Execute query
  const jobs = await IngestionJob.find(filter)
    .populate("documentId", "title")
    .sort({ startedAt: -1 })
    .skip(skip)
    .limit(limit);
  console.log("🚀 ~ exports.getIngestionJobs= ~ jobs:", jobs);

  // Get total count
  const total = await IngestionJob.countDocuments(filter);

  return apiSuccess(res, {
    jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

/**
 * @desc    Get ingestion job by ID
 * @route   GET /api/ingestion/:id
 * @access  Private/Admin
 */
exports.getIngestionJobById = async (req, res) => {
  const job = await IngestionJob.findById(req.params.id).populate(
    "documentId",
    "title filePath"
  );

  if (!job) {
    return apiNotFound(res, "Ingestion job not found");
  }

  return apiSuccess(res, job);
};

/**
 * @desc    Update ingestion job status
 * @route   PUT /api/ingestion/:id
 * @access  Private/Admin
 */
exports.updateIngestionJobStatus = async (req, res) => {
  const { status, errorMessage } = req.body;

  // Find job
  const job = await IngestionJob.findById(req.params.id);

  if (!job) {
    return apiNotFound(res, "Ingestion job not found");
  }

  // Update status
  job.status = status;

  // If completed or failed, set completedAt
  if (status === "completed" || status === "failed") {
    job.completedAt = new Date();
  }

  // If failed, set error message
  if (status === "failed" && errorMessage) {
    job.errorMessage = errorMessage;
  }

  // Save job
  await job.save();

  return apiUpdated(res, job, "Ingestion job updated successfully");
};

/**
 * @desc    Get document ingestion status
 * @route   GET /api/ingestion/document/:documentId
 * @access  Private
 */
exports.getDocumentIngestionStatus = async (req, res) => {
  // Find document
  const document = await Document.findOne({
    _id: req.params.documentId,
    isDeleted: false,
  });

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Get latest ingestion job
  const job = await IngestionJob.findOne({ documentId: document._id }).sort({
    startedAt: -1,
  });

  if (!job) {
    return apiNotFound(res, "No ingestion job found for this document");
  }

  return apiSuccess(res, job);
};

/**
 * @desc    Trigger document ingestion
 * @route   POST /api/ingestion/document/:documentId
 * @access  Private
 */
exports.triggerDocumentIngestion = async (req, res) => {
  // Find document
  const document = await Document.findOne({
    _id: req.params.documentId,
    isDeleted: false,
  });

  if (!document) {
    return apiNotFound(res, "Document not found");
  }

  // Create new ingestion job
  const job = await IngestionJob.create({
    documentId: document._id,
    status: "pending",
  });

  return apiSuccess(res, job, "Ingestion job created successfully");
};
