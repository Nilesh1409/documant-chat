require("dotenv").config()

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  upload: {
    directory: process.env.UPLOAD_DIR || "./uploads",
    maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB in bytes
    allowedFileTypes: (
      process.env.ALLOWED_FILE_TYPES ||
      "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
    ).split(","),
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
}
