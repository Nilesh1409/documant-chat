const jwt = require("jsonwebtoken")
const User = require("../models/User")
const Document = require("../models/Document") // Import Document model
const { apiUnauthorized, apiForbidden, apiNotFound } = require("../utils/apiResponse") // Declare apiNotFound variable
const config = require("../config/config")

/**
 * Middleware to protect routes - verifies JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Check if token exists
    if (!token) {
      return apiUnauthorized(res, "You are not logged in. Please log in to get access.")
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret)

    // Check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
      return apiUnauthorized(res, "The user belonging to this token no longer exists.")
    }

    // Check if user is active
    if (!currentUser.isActive) {
      return apiUnauthorized(res, "This user account has been deactivated.")
    }

    // Grant access to protected route
    req.user = currentUser
    next()
  } catch (error) {
    return apiUnauthorized(res, "Invalid token. Please log in again.")
  }
}

/**
 * Middleware to restrict access to specific roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return apiForbidden(res, "You do not have permission to perform this action")
    }
    next()
  }
}

/**
 * Middleware to check if user has permission for a document
 */
exports.checkDocumentPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const { id: documentId } = req.params
      const userId = req.user._id

      // Admin users bypass permission check
      if (req.user.role === "admin") {
        return next()
      }

      // Check if document exists and user is the creator
      const document = await Document.findById(documentId)
      if (!document) {
        return apiNotFound(res, "Document not found") // Use apiNotFound variable
      }

      // If user is the creator, they have full access
      if (document.createdBy.toString() === userId.toString()) {
        return next()
      }

      // Check permissions in the permissions collection
      const DocumentPermission = require("../models/DocumentPermission")
      const hasPermission = await DocumentPermission.hasPermission(userId, documentId, requiredPermission)

      if (!hasPermission) {
        return apiForbidden(res, "You do not have permission to perform this action on this document")
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
