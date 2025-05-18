const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // Don't include password in query results by default
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "editor", "viewer"],
      default: "viewer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash
        return ret
      },
      virtuals: true,
    },
    toObject: { virtuals: true },
  },
)

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`
  }
  if (this.firstName) return this.firstName
  if (this.lastName) return this.lastName
  return ""
})

// Method to check password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash)
}

// Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Static method to find user by email
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email })
}

const User = mongoose.model("User", UserSchema)

module.exports = User
