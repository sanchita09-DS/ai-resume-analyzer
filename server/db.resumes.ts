/**
 * Database helpers for resume operations
 */

import { eq, desc, and } from "drizzle-orm";
import { getDb } from "./db";
import { resumes, analyses, chatHistory, generatedContent, InsertResume, Resume } from "../drizzle/schema";

/**
 * Create a new resume record
 */
export async function createResume(data: InsertResume): Promise<Resume | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(resumes).values(data);
    const insertedId = (result as any).insertId;
    return getResumeById(insertedId);
  } catch (error) {
    console.error("Failed to create resume:", error);
    throw error;
  }
}

/**
 * Get resume by ID
 */
export async function getResumeById(id: number): Promise<Resume | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to get resume:", error);
    throw error;
  }
}

/**
 * Get all resumes for a user
 */
export async function getUserResumes(userId: number): Promise<Resume[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.createdAt));
  } catch (error) {
    console.error("Failed to get user resumes:", error);
    throw error;
  }
}

/**
 * Update resume with analysis results
 */
export async function updateResumeAnalysis(
  resumeId: number,
  data: {
    atsScore?: number;
    readabilityScore?: number;
    keywordDensity?: string;
    skillsExtracted?: string;
    jobRoleMatches?: string;
  }
): Promise<Resume | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(resumes).set(data).where(eq(resumes.id, resumeId));
    return getResumeById(resumeId);
  } catch (error) {
    console.error("Failed to update resume:", error);
    throw error;
  }
}

/**
 * Delete resume and all related data
 */
export async function deleteResume(resumeId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Delete will cascade to analyses, chatHistory, and generatedContent
    await db.delete(resumes).where(eq(resumes.id, resumeId));
    return true;
  } catch (error) {
    console.error("Failed to delete resume:", error);
    throw error;
  }
}

/**
 * Get or create analysis for a resume
 */
export async function getOrCreateAnalysis(resumeId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    let result = await db
      .select()
      .from(analyses)
      .where(eq(analyses.resumeId, resumeId))
      .limit(1);

    if (result.length === 0) {
      await db.insert(analyses).values({
        resumeId,
        userId,
      });
      result = await db
        .select()
        .from(analyses)
        .where(eq(analyses.resumeId, resumeId))
        .limit(1);
    }

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to get or create analysis:", error);
    throw error;
  }
}

/**
 * Update analysis with feedback
 */
export async function updateAnalysis(
  analysisId: number,
  data: {
    summaryFeedback?: string;
    experienceFeedback?: string;
    educationFeedback?: string;
    skillsFeedback?: string;
    overallFeedback?: string;
    skillGaps?: string;
    skillMatches?: string;
    targetJobDescription?: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.update(analyses).set(data).where(eq(analyses.id, analysisId));
  } catch (error) {
    console.error("Failed to update analysis:", error);
    throw error;
  }
}

/**
 * Get chat history for a resume
 */
export async function getChatHistory(resumeId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.resumeId, resumeId))
      .orderBy(chatHistory.createdAt);
  } catch (error) {
    console.error("Failed to get chat history:", error);
    throw error;
  }
}

/**
 * Add chat message
 */
export async function addChatMessage(
  resumeId: number,
  userId: number,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(chatHistory).values({
      resumeId,
      userId,
      role,
      content,
    });
  } catch (error) {
    console.error("Failed to add chat message:", error);
    throw error;
  }
}

/**
 * Save generated content (cover letter, LinkedIn suggestions)
 */
export async function saveGeneratedContent(
  resumeId: number,
  userId: number,
  contentType: "coverLetter" | "linkedinHeadline" | "linkedinSummary" | "linkedinSkills",
  generatedText: string,
  jobDescription?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(generatedContent).values({
      resumeId,
      userId,
      contentType,
      generatedText,
      jobDescription,
    });
  } catch (error) {
    console.error("Failed to save generated content:", error);
    throw error;
  }
}

/**
 * Get generated content by type
 */
export async function getGeneratedContent(
  resumeId: number,
  contentType: "coverLetter" | "linkedinHeadline" | "linkedinSummary" | "linkedinSkills"
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(generatedContent)
      .where(
        and(
          eq(generatedContent.resumeId, resumeId),
          eq(generatedContent.contentType, contentType)
        )
      )
      .orderBy(desc(generatedContent.createdAt))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to get generated content:", error);
    throw error;
  }
}
