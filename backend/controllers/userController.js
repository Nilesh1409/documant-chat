const User = require("../models/User")
const { apiSuccess, apiCreated, apiUpdated, apiDeleted, apiNotFound, apiBadRequest } = require("../utils/apiResponse")

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res) => {
  // Pagination
  const page = Number.parseInt(req.query.page, 10) || 1
  const limit = Number.parseInt(req.query.limit, 10) || 10
  const skip = (page - 1) * limit

  // Query parameters
  const filter = {}
  if (req.query.role) filter.role = req.query.role
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true"

  // Execute query
  const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)

  // Get total count
  const total = await User.countDocuments(filter)

  return apiSuccess(res, {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return apiNotFound(res, "User not found")
  }

  return apiSuccess(res, user)
}

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Private/Admin
 */
exports.createUser = async (req, res) => {
  const { email, password, firstName, lastName, role } = req.body

  // Check if user already exists
  const userExists = await User.findOne({ email })
  if (userExists) {
    return apiBadRequest(res, "User already exists")
  }

  // Create user
  const user = await User.create({
    email,
    passwordHash: password, // Will be hashed by pre-save hook
    firstName,
    lastName,
    role,
  })

  return apiCreated(res, user, "User created successfully")
}

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res) => {
  const { firstName, lastName, role, isActive, password } = req.body

  // Find user
  const user = await User.findById(req.params.id)
  if (!user) {
    return apiNotFound(res, "User not found")
  }

  // Update fields
  if (firstName !== undefined) user.firstName = firstName
  if (lastName !== undefined) user.lastName = lastName
  if (role !== undefined) user.role = role
  if (isActive !== undefined) user.isActive = isActive
  if (password) user.passwordHash = password

  // Save user
  await user.save()

  return apiUpdated(res, user, "User updated successfully")
}

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) {
    return apiNotFound(res, "User not found")
  }

  await user.deleteOne()

  return apiDeleted(res, "User deleted successfully")
}
