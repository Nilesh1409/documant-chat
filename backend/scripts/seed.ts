import { db } from "../lib/db"
import { users, documents, documentVersions, documentPermissions } from "../lib/schema"
import { faker } from "@faker-js/faker"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

async function seed() {
  console.log("🌱 Starting database seeding...")

  // Clear existing data (be careful with this in production!)
  await db.delete(documentPermissions)
  await db.delete(documentVersions)
  await db.delete(documents)
  await db.delete(users)

  console.log("Creating admin user...")
  // Create admin user
  const adminId = randomUUID()
  await db.insert(users).values({
    id: adminId,
    email: "admin@example.com",
    passwordHash: await bcrypt.hash("Admin123!", 10),
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isActive: true,
  })

  // Create sample users
  console.log("Creating sample users...")
  const userIds = []
  const roles = ["admin", "editor", "viewer"]

  for (let i = 0; i < 10; i++) {
    const userId = randomUUID()
    userIds.push(userId)

    await db.insert(users).values({
      id: userId,
      email: faker.internet.email(),
      passwordHash: await bcrypt.hash("Password123!", 10),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: roles[Math.floor(Math.random() * roles.length)] as any,
      isActive: true,
    })
  }

  // Create sample documents
  console.log("Creating sample documents...")
  const documentIds = []

  for (let i = 0; i < 20; i++) {
    const documentId = randomUUID()
    documentIds.push(documentId)

    const creatorId = userIds[Math.floor(Math.random() * userIds.length)]

    await db.insert(documents).values({
      id: documentId,
      title: faker.lorem.sentence(3),
      description: faker.lorem.paragraph(),
      filePath: `/uploads/documents/${faker.system.commonFileName("pdf")}`,
      fileType: "application/pdf",
      fileSize: Math.floor(Math.random() * 10000000),
      createdBy: creatorId,
      isDeleted: false,
    })

    // Create document versions
    const versionCount = Math.floor(Math.random() * 3) + 1
    for (let v = 1; v <= versionCount; v++) {
      await db.insert(documentVersions).values({
        id: randomUUID(),
        documentId: documentId,
        versionNumber: v,
        filePath: `/uploads/documents/${faker.system.commonFileName("pdf")}`,
        createdBy: creatorId,
        changeSummary: v === 1 ? "Initial version" : faker.lorem.sentence(),
      })
    }

    // Assign permissions
    const permissionCount = Math.floor(Math.random() * 5) + 1
    const permissionTypes = ["read", "write", "admin"]

    for (let p = 0; p < permissionCount; p++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)]

      await db.insert(documentPermissions).values({
        id: randomUUID(),
        documentId: documentId,
        userId: userId,
        permissionType: permissionTypes[Math.floor(Math.random() * permissionTypes.length)] as any,
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
    process.exit(0)
  })
