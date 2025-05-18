/**
 * Standard API response format
 */

// Success responses
exports.apiSuccess = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

exports.apiCreated = (res, data, message = "Resource created successfully") => {
  return this.apiSuccess(res, data, message, 201)
}

exports.apiUpdated = (res, data, message = "Resource updated successfully") => {
  return this.apiSuccess(res, data, message, 200)
}

exports.apiDeleted = (res, message = "Resource deleted successfully") => {
  return res.status(200).json({
    success: true,
    message,
  })
}

// Error responses
exports.apiError = (res, message = "Internal server error", statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  })
}

exports.apiBadRequest = (res, message = "Bad request") => {
  return this.apiError(res, message, 400)
}

exports.apiUnauthorized = (res, message = "Unauthorized") => {
  return this.apiError(res, message, 401)
}

exports.apiForbidden = (res, message = "Forbidden") => {
  return this.apiError(res, message, 403)
}

exports.apiNotFound = (res, message = "Resource not found") => {
  return this.apiError(res, message, 404)
}

exports.apiValidationError = (res, errors, message = "Validation error") => {
  return res.status(422).json({
    success: false,
    message,
    errors,
  })
}
