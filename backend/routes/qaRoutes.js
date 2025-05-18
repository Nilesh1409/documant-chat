const express = require("express");
const router = express.Router();
const qaController = require("../controllers/qaController");
const { protect } = require("../middleware/auth");

// All routes are protected
router.use(protect);

// Q&A routes
router.post("/ask", qaController.askQuestion);
router.get("/history", qaController.getHistory);
router.delete("/history/:id", qaController.deleteHistoryItem);
router.delete("/history", qaController.clearHistory);
router.post("/index/:documentId", qaController.indexDocumentForRAG);

module.exports = router;
