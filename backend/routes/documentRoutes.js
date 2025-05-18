const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const {
  protect,
  restrictTo,
  checkDocumentPermission,
} = require("../middleware/auth");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");
const {
  createDocumentSchema,
  updateDocumentSchema,
  documentPermissionSchema,
} = require("../utils/validators");

// All routes are protected
router.use(protect);

// Document routes
router
  .route("/")
  .get(documentController.getDocuments)
  .post(
    upload.single("file"),
    validate(createDocumentSchema),
    documentController.createDocument
  );

router
  .route("/:id")
  .get(checkDocumentPermission("read"), documentController.getDocumentById)
  .put(
    checkDocumentPermission("write"),
    validate(updateDocumentSchema),
    documentController.updateDocument
  )
  .delete(checkDocumentPermission("write"), documentController.deleteDocument);

// Version routes
router.post(
  "/:id/versions",
  checkDocumentPermission("write"),
  upload.single("file"),
  documentController.uploadVersion
);

router.get(
  "/:id/versions",
  checkDocumentPermission("read"),
  documentController.getDocumentVersions
);

router.get(
  "/:id/versions/:versionNumber",
  checkDocumentPermission("read"),
  documentController.getDocumentVersion
);

// Add the download routes
router.get(
  "/:id/download",
  checkDocumentPermission("read"),
  documentController.downloadDocument
);
router.get(
  "/:id/versions/:versionNumber/download",
  checkDocumentPermission("read"),
  documentController.downloadDocumentVersion
);

// Permission routes
router.get(
  "/:id/permissions",
  checkDocumentPermission("admin"),
  documentController.getDocumentPermissions
);

router.post(
  "/:id/permissions",
  checkDocumentPermission("admin"),
  validate(documentPermissionSchema),
  documentController.addDocumentPermission
);

router.delete(
  "/:id/permissions/:permissionId",
  checkDocumentPermission("admin"),
  documentController.removeDocumentPermission
);

// Admin-only routes
router.delete(
  "/:id/permanent",
  restrictTo("admin"),
  documentController.permanentDeleteDocument
);

module.exports = router;
