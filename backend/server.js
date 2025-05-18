require("dotenv").config();
require("express-async-errors");
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

// Set up uncaught exception handler
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to MongoDB
connectDB();

// Start the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
  const URL = "https://doc-chat-1.onrender.com";
  const backend =
    "https://document-management-system-latest.onrender.com/api/health";

  async function ping() {
    try {
      const res = await fetch(URL, { method: "GET", timeout: 10000 });
      console.log(
        `⏱️  FRONTEND Self-ping at ${new Date().toISOString()}: ${res.status}`
      );
      const backendRes = await fetch(backend, {
        method: "GET",
        timeout: 10000,
      });
      console.log(
        `⏱️  BACKEND Self-ping at ${new Date().toISOString()}: ${res.status}`
      );
    } catch (err) {
      console.error("❌ Self-ping failed:", err.message);
    }
  }

  // run immediately on startup
  ping();

  // schedule every 4 minutes (240 000 ms)
  setInterval(ping, 240_000);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal
process.on("SIGTERM", () => {
  logger.info("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    logger.info("💥 Process terminated!");
  });
});
