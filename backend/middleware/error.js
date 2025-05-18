const logger = require("../utils/logger")
const { apiError } = require("../utils/apiResponse")
const mongoose = require("mongoose")

/**
 * Global error handling middleware
 */
module.exports = (err, req, res, next) => {
  // Log error
  logger.error(err)

  // Default error
  let statusCode = err.statusCode || 500
  let message = err.message || "Something went wrong"

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400
    const errors = Object.values(err.errors).map((val) => val.message)
    message = `Invalid input data: ${errors.join(", ")}`
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue)[0]
    message = `Duplicate field value: ${field}. Please use another value.`
  }

  // Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401
    message = "Invalid token. Please log in again."
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401
    message = "Your token has expired. Please log in again."
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400
    message = "File too large. Maximum file size is 10MB."
  }

  // Send error response
  return apiError(res, message, statusCode)
}
