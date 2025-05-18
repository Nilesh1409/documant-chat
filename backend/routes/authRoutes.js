const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { protect } = require("../middleware/auth")
const validate = require("../middleware/validate")
const { registerSchema, loginSchema, updateUserSchema } = require("../utils/validators")

// Public routes
router.post("/register", validate(registerSchema), authController.register)
router.post("/login", validate(loginSchema), authController.login)

// Protected routes
router.get("/me", protect, authController.getMe)
router.put("/me", protect, validate(updateUserSchema), authController.updateMe)

module.exports = router
