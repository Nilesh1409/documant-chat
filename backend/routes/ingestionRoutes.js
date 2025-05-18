const express = require("express");
const router = express.Router();
const ingestionController = require("../controllers/ingestionController");
const {
  protect,
  restrictTo,
  checkDocumentPermission,
} = require("../middleware/auth");
const validate = require("../middleware/validate");
const { ingestionJobSchema } = require("../utils/validators");

// All routes are protected
router.use(protect);

// Admin-only routes
router.get("/", restrictTo("admin"), ingestionController.getIngestionJobs);
router.get(
  "/:id",
  restrictTo("admin"),
  ingestionController.getIngestionJobById
);
router.put(
  "/:id",
  restrictTo("admin"),
  validate(ingestionJobSchema),
  ingestionController.updateIngestionJobStatus
);

// Document-specific routes (requires document permission)
router.get(
  "/document/:documentId",
  checkDocumentPermission("read"),
  ingestionController.getDocumentIngestionStatus
);

router.post(
  "/document/:documentId",
  checkDocumentPermission("write"),
  ingestionController.triggerDocumentIngestion
);

module.exports = router;
