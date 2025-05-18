const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const { protect, restrictTo } = require("../middleware/auth")
const validate = require("../middleware/validate")
const { registerSchema, updateUserSchema } = require("../utils/validators")

// All routes are protected and restricted to admin
router.use(protect)
router.use(restrictTo("admin"))

router.route("/").get(userController.getUsers).post(validate(registerSchema), userController.createUser)

router
  .route("/:id")
  .get(userController.getUserById)
  .put(validate(updateUserSchema), userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router
