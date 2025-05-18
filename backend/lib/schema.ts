import { pgTable, uuid, varchar, timestamp, boolean, integer, text, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "editor", "viewer"])
export const permissionTypeEnum = pgEnum("permission_type", ["read", "write", "admin"])
export const ingestionStatusEnum = pgEnum("ingestion_status", ["pending", "processing", "completed", "failed"])

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  role: userRoleEnum("role").default("viewer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
})

// Documents table
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  filePath: varchar("file_path", { length: 1000 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: integer("file_size").notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
})

// Document versions table
export const documentVersions = pgTable("document_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id")
    .references(() => documents.id)
    .notNull(),
  versionNumber: integer("version_number").notNull(),
  filePath: varchar("file_path", { length: 1000 }).notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  changeSummary: text("change_summary"),
})

// Document permissions table
export const documentPermissions = pgTable("document_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id")
    .references(() => documents.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  permissionType: permissionTypeEnum("permission_type").default("read").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Ingestion jobs table
export const ingestionJobs = pgTable("ingestion_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id")
    .references(() => documents.id)
    .notNull(),
  status: ingestionStatusEnum("status").default("pending").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
})

// Document tags table
export const documentTags = pgTable("document_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id")
    .references(() => documents.id)
    .notNull(),
  tagName: varchar("tag_name", { length: 100 }).notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  documents: many(documents),
  documentVersions: many(documentVersions),
  documentPermissions: many(documentPermissions),
}))

export const documentsRelations = relations(documents, ({ one, many }) => ({
  creator: one(users, {
    fields: [documents.createdBy],
    references: [users.id],
  }),
  versions: many(documentVersions),
  permissions: many(documentPermissions),
  ingestionJobs: many(ingestionJobs),
  tags: many(documentTags),
}))

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  document: one(documents, {
    fields: [documentVersions.documentId],
    references: [documents.id],
  }),
  creator: one(users, {
    fields: [documentVersions.createdBy],
    references: [users.id],
  }),
}))

export const documentPermissionsRelations = relations(documentPermissions, ({ one }) => ({
  document: one(documents, {
    fields: [documentPermissions.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentPermissions.userId],
    references: [users.id],
  }),
}))

export const ingestionJobsRelations = relations(ingestionJobs, ({ one }) => ({
  document: one(documents, {
    fields: [ingestionJobs.documentId],
    references: [documents.id],
  }),
}))

export const documentTagsRelations = relations(documentTags, ({ one }) => ({
  document: one(documents, {
    fields: [documentTags.documentId],
    references: [documents.id],
  }),
}))
