/**
 * Resume upload and analysis router - Using trained ML models instead of APIs
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";
import { extractResumeText, normalizeText, extractSkills, suggestJobRoles } from "../utils/fileParser";
import { scoreResume } from "../utils/scoringEngine";
import {
  createResume,
  getUserResumes,
  getResumeById,
  updateResumeAnalysis,
  deleteResume,
  getOrCreateAnalysis,
  updateAnalysis,
} from "../db.resumes";

// ML Models (no API calls)
import * as feedbackGenerator from "../ml/feedbackGenerator";
import * as sectionClassifier from "../ml/sectionClassifier";

export const resumeRouter = router({
  /**
   * Upload and analyze a resume using trained ML models
   */
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileBuffer: z.string(), // Base64 encoded file
        fileType: z.enum(["pdf", "docx"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 file
        console.log("[Resume Upload] Starting upload for:", input.fileName, "Type:", input.fileType);
        const buffer = Buffer.from(input.fileBuffer, "base64");
        console.log("[Resume Upload] Buffer decoded, size:", buffer.length);

        // Extract text from file
        console.log("[Resume Upload] Extracting text from", input.fileType);
        const extractedText = await extractResumeText(buffer, input.fileType);
        console.log("[Resume Upload] Text extracted, length:", extractedText.length);
        const normalizedText = normalizeText(extractedText);
        console.log("[Resume Upload] Text normalized, length:", normalizedText.length);

        // Extract skills and job roles
        const skills = extractSkills(normalizedText);
        const jobRoles = suggestJobRoles(normalizedText, skills);

        // Calculate scores
        const scores = scoreResume(normalizedText);

        // Upload file to storage
        const { url: fileUrl, key: fileKey } = await storagePut(
          `resumes/${ctx.user.id}/${Date.now()}-${input.fileName}`,
          buffer,
          input.fileType === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );

        // Create resume record
        const resume = await createResume({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileKey,
          fileUrl,
          fileType: input.fileType,
          extractedText: normalizedText,
          atsScore: scores.atsScore,
          readabilityScore: scores.readabilityScore,
          keywordDensity: JSON.stringify(scores.keywordDensity),
          skillsExtracted: JSON.stringify(skills),
          jobRoleMatches: JSON.stringify(jobRoles),
        });

        if (!resume) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create resume record",
          });
        }

        // Create analysis record
        const analysis = await getOrCreateAnalysis(resume.id, ctx.user.id);

        // Generate feedback using trained ML models (NO API CALLS)
        console.log("[Resume Upload] Generating ML-based feedback...");
        
        // Classify resume sections using ML
        const summarySection = sectionClassifier.extractSection(normalizedText, 'summary')?.content || '';
        const experienceSection = sectionClassifier.extractSection(normalizedText, 'experience')?.content || '';
        const educationSection = sectionClassifier.extractSection(normalizedText, 'education')?.content || '';
        const skillsSection = sectionClassifier.extractSection(normalizedText, 'skills')?.content || '';
        
        // Generate feedback using trained ML models
        const summaryAnalysis = feedbackGenerator.analyzeSummary(summarySection);
        const experienceAnalysis = feedbackGenerator.analyzeExperience(experienceSection);
        const educationAnalysis = feedbackGenerator.analyzeEducation(educationSection);
        const skillsAnalysis = feedbackGenerator.analyzeSkills(skillsSection);
        
        const overallAnalysis = feedbackGenerator.generateOverallFeedback(
          summaryAnalysis,
          experienceAnalysis,
          educationAnalysis,
          skillsAnalysis
        );
        
        const feedback = {
          summaryFeedback: summaryAnalysis.suggestions.join(' ') || 'Review your summary for clarity and impact.',
          experienceFeedback: experienceAnalysis.suggestions.join(' ') || 'Highlight quantifiable achievements in your experience.',
          educationFeedback: educationAnalysis.suggestions.join(' ') || 'Include relevant certifications and coursework.',
          skillsFeedback: skillsAnalysis.suggestions.join(' ') || 'Prioritize skills relevant to your target role.',
          overallFeedback: overallAnalysis.topPriorities.join(' ') || 'Consider tailoring your resume for specific job descriptions.',
        };

        // Update analysis with feedback
        if (analysis) {
          await updateAnalysis(analysis.id, {
            summaryFeedback: feedback.summaryFeedback,
            experienceFeedback: feedback.experienceFeedback,
            educationFeedback: feedback.educationFeedback,
            skillsFeedback: feedback.skillsFeedback,
            overallFeedback: feedback.overallFeedback,
          });
        }

        return {
          success: true,
          resume: {
            id: resume.id,
            fileName: resume.fileName,
            atsScore: resume.atsScore,
            readabilityScore: resume.readabilityScore,
            skills: skills,
            jobRoles: jobRoles,
          },
        };
      } catch (error) {
        console.error("[Resume Upload] Error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("[Resume Upload] Error details:", errorMessage);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
        });
      }
    }),

  /**
   * Get user's resumes
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const resumes = await getUserResumes(ctx.user.id);
      return resumes;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch resumes",
      });
    }
  }),

  /**
   * Get specific resume with analysis
   */
  getById: protectedProcedure
    .input(z.object({ resumeId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const resume = await getResumeById(input.resumeId);
        if (!resume || resume.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Resume not found",
          });
        }
        return resume;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch resume",
        });
      }
    }),

  /**
   * Delete resume
   */
  delete: protectedProcedure
    .input(z.object({ resumeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const resume = await getResumeById(input.resumeId);
        if (!resume || resume.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Resume not found",
          });
        }
        await deleteResume(input.resumeId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete resume",
        });
      }
    }),
});
