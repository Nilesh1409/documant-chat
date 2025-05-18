const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const documentRoutes = require("./routes/documentRoutes");
const ingestionRoutes = require("./routes/ingestionRoutes");
const qaRoutes = require("./routes/qaRoutes");
// Import middleware
const errorMiddleware = require("./middleware/error");
const { apiNotFound } = require("./utils/apiResponse");

// Import Swagger docs
const { swaggerDocs } = require("./swagger");

// Create Express app
const app = express();

// Security HTTP headers
app.use(helmet());

// CORS
app.use(cors());

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Compression
app.use(compression());

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  // Create a write stream for access logs
  const accessLogStream = fs.createWriteStream(
    path.join(logsDir, "access.log"),
    { flags: "a" }
  );
  app.use(morgan("combined", { stream: accessLogStream }));
}

// Rate limiting
const limiter = rateLimit({
  max: 100, // 100 requests per IP
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", limiter);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ingestion", ingestionRoutes);
app.use("/api/qa", qaRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "success", message: "Server is running" });
});

// Setup Swagger docs
swaggerDocs(app, process.env.PORT || 8080);

// Handle 404 routes
app.all("*", (req, res) => {
  apiNotFound(res, `Can't find ${req.originalUrl} on this server!`);
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;
