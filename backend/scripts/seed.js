import mongoose from "mongoose"
import { faker } from "@faker-js/faker"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

// Import models
import User from "../models/User.js"
import Document from "../models/Document.js"
import DocumentVersion from "../models/DocumentVersion.js"
import DocumentPermission from "../models/DocumentPermission.js"
import IngestionJob from "../models/IngestionJob.js"

// Load environment variables
dotenv.config()

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err)
    process.exit(1)
  })

async function seed() {
  console.log("🌱 Starting database seeding...")

  // Clear existing data
  await User.deleteMany({})
  await Document.deleteMany({})
  await DocumentVersion.deleteMany({})
  await DocumentPermission.deleteMany({})
  await IngestionJob.deleteMany({})

  console.log("Creating admin user...")
  // Create admin user
  const adminUser = await User.create({
    email: "admin@example.com",
    passwordHash: await bcrypt.hash("Admin123!", 10),
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isActive: true,
  })

  // Create sample users
  console.log("Creating sample users...")
  const users = [adminUser]
  const roles = ["admin", "editor", "viewer"]

  for (let i = 0; i < 10; i++) {
    const user = await User.create({
      email: faker.internet.email(),
      passwordHash: await bcrypt.hash("Password123!", 10),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: roles[Math.floor(Math.random() * roles.length)],
      isActive: true,
    })

    users.push(user)
  }

  // Create sample documents
  console.log("Creating sample documents...")
  const documents = []

  for (let i = 0; i < 20; i++) {
    const creator = users[Math.floor(Math.random() * users.length)]

    const document = await Document.create({
      title: faker.lorem.sentence(3),
      description: faker.lorem.paragraph(),
      filePath: `/uploads/documents/${faker.system.commonFileName("pdf")}`,
      fileType: "application/pdf",
      fileSize: Math.floor(Math.random() * 10000000),
      createdBy: creator._id,
      isDeleted: false,
      tags: Array(Math.floor(Math.random() * 5))
        .fill()
        .map(() => faker.word.sample()),
    })

    documents.push(document)

    // Create document versions
    const versionCount = Math.floor(Math.random() * 3) + 1
    for (let v = 1; v <= versionCount; v++) {
      await DocumentVersion.create({
        documentId: document._id,
        versionNumber: v,
        filePath: `/uploads/documents/${faker.system.commonFileName("pdf")}`,
        createdBy: creator._id,
        changeSummary: v === 1 ? "Initial version" : faker.lorem.sentence(),
      })
    }

    // Create ingestion job
    await IngestionJob.create({
      documentId: document._id,
      status: ["pending", "processing", "completed", "failed"][Math.floor(Math.random() * 4)],
      startedAt: new Date(),
      completedAt: Math.random() > 0.3 ? new Date() : null,
      errorMessage: Math.random() > 0.8 ? faker.lorem.sentence() : null,
    })

    // Assign permissions
    const permissionCount = Math.floor(Math.random() * 5) + 1
    const permissionTypes = ["read", "write", "admin"]

    const assignedUsers = new Set()

    for (let p = 0; p < permissionCount; p++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]

      // Avoid duplicate permissions
      if (assignedUsers.has(randomUser._id.toString())) continue
      assignedUsers.add(randomUser._id.toString())

      await DocumentPermission.create({
        documentId: document._id,
        userId: randomUser._id,
        permissionType: permissionTypes[Math.floor(Math.random() * permissionTypes.length)],
      })
    }
  }

  console.log("✅ Seeding completed successfully!")
}

// Run the seed function
seed()
  .catch((e) => {
    console.error("Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    console.log("Closing database connection...")
    await mongoose.disconnect()
    process.exit(0)
  })
