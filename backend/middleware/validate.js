const { apiValidationError } = require("../utils/apiResponse")

/**
 * Middleware to validate request data against a Joi schema
 */
const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }))

      return apiValidationError(res, errors)
    }

    // Replace request data with validated data
    req[property] = value
    next()
  }
}

module.exports = validate
