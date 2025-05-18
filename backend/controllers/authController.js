const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { apiSuccess, apiCreated, apiUnauthorized, apiBadRequest } = require("../utils/apiResponse")
const config = require("../config/config")

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
}

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
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

  // Generate token
  const token = generateToken(user._id)

  // Send response
  return apiCreated(
    res,
    {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        fullName: user.fullName,
      },
      token,
    },
    "User registered successfully",
  )
}

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  const { email, password } = req.body

  // Find user
  const user = await User.findOne({ email }).select("+passwordHash")
  if (!user) {
    return apiUnauthorized(res, "Invalid credentials")
  }

  // Check if user is active
  if (!user.isActive) {
    return apiUnauthorized(res, "Your account has been deactivated")
  }

  // Check password
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    return apiUnauthorized(res, "Invalid credentials")
  }

  // Generate token
  const token = generateToken(user._id)

  // Send response
  return apiSuccess(
    res,
    {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        fullName: user.fullName,
      },
      token,
    },
    "Login successful",
  )
}

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  const user = req.user

  return apiSuccess(res, {
    _id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    fullName: user.fullName,
  })
}

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
exports.updateMe = async (req, res) => {
  const { firstName, lastName, password } = req.body
  const userId = req.user._id

  // Find user
  const user = await User.findById(userId)

  // Update fields
  if (firstName !== undefined) user.firstName = firstName
  if (lastName !== undefined) user.lastName = lastName
  if (password) user.passwordHash = password

  // Save user
  await user.save()

  return apiSuccess(
    res,
    {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      fullName: user.fullName,
    },
    "Profile updated successfully",
  )
}
