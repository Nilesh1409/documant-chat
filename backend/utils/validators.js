const Joi = require("joi");

// User validation schemas
exports.registerSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  role: Joi.string().valid("admin", "editor", "viewer").default("viewer"),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().required(),
});

exports.updateUserSchema = Joi.object({
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  role: Joi.string().valid("admin", "editor", "viewer"),
  isActive: Joi.boolean(),
  password: Joi.string().min(8),
}).min(1);

// Document validation schemas
exports.createDocumentSchema = Joi.object({
  title: Joi.string().required().trim().max(255),
  description: Joi.string().trim(),
  // tags: Joi.array().items(Joi.string().trim()),
});

exports.updateDocumentSchema = Joi.object({
  title: Joi.string().trim().max(255),
  description: Joi.string().trim(),
  tags: Joi.array().items(Joi.string().trim()),
  isDeleted: Joi.boolean(),
}).min(1);

// Document permission validation schema
exports.documentPermissionSchema = Joi.object({
  userId: Joi.string().required(),
  permissionType: Joi.string().valid("read", "write", "admin").required(),
});

// Ingestion job validation schema
exports.ingestionJobSchema = Joi.object({
  documentId: Joi.string().required(),
  status: Joi.string().valid("pending", "processing", "completed", "failed"),
});
