import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Resumes table: stores uploaded resumes with extracted text and metadata
 */
export const resumes = mysqlTable("resumes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 key for storage
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(), // S3 URL
  fileType: varchar("fileType", { length: 20 }).notNull(), // 'pdf' or 'docx'
  extractedText: text("extractedText"), // Full text extracted from resume
  atsScore: int("atsScore"), // 0-100
  readabilityScore: int("readabilityScore"), // 0-100
  keywordDensity: text("keywordDensity"), // JSON: { keyword: count }
  skillsExtracted: text("skillsExtracted"), // JSON array of skills
  jobRoleMatches: text("jobRoleMatches"), // JSON array of suggested job roles
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = typeof resumes.$inferInsert;

/**
 * Analyses table: stores detailed analysis results per resume
 */
export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  resumeId: int("resumeId").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  summaryFeedback: text("summaryFeedback"), // AI-generated feedback for Summary section
  experienceFeedback: text("experienceFeedback"), // AI-generated feedback for Experience section
  educationFeedback: text("educationFeedback"), // AI-generated feedback for Education section
  skillsFeedback: text("skillsFeedback"), // AI-generated feedback for Skills section
  overallFeedback: text("overallFeedback"), // General improvement suggestions
  skillGaps: text("skillGaps"), // JSON: missing skills from job description
  skillMatches: text("skillMatches"), // JSON: matched skills
  targetJobDescription: text("targetJobDescription"), // Job description used for comparison
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

/**
 * Chat history table: stores conversations between user and AI chatbot
 */
export const chatHistory = mysqlTable("chatHistory", {
  id: int("id").autoincrement().primaryKey(),
  resumeId: int("resumeId").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatHistory.$inferSelect;
export type InsertChatMessage = typeof chatHistory.$inferInsert;

/**
 * Generated content table: stores cover letters and LinkedIn suggestions
 */
export const generatedContent = mysqlTable("generatedContent", {
  id: int("id").autoincrement().primaryKey(),
  resumeId: int("resumeId").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  contentType: mysqlEnum("contentType", ["coverLetter", "linkedinHeadline", "linkedinSummary", "linkedinSkills"]).notNull(),
  jobDescription: text("jobDescription"), // Job description used for generation
  generatedText: text("generatedText").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertGeneratedContent = typeof generatedContent.$inferInsert;