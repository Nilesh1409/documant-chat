const multer = require("multer")
const path = require("path")
const fs = require("fs")
const crypto = require("crypto")
const config = require("../config/config")

// Ensure upload directory exists
const uploadDir = path.resolve(config.upload.directory)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`
    const fileExt = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${fileExt}`)
  },
})

// File filter to check allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = config.upload.allowedFileTypes

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(", ")}`), false)
  }
}

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize, // Default: 10MB
  },
})

module.exports = upload
