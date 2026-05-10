/**
 * Resume upload and analysis router
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
import { invokeLLM } from "../_core/llm";

export const resumeRouter = router({
  /**
   * Upload and analyze a resume
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

        // Generate AI feedback for each section
        const feedbackPrompt = `You are an expert resume reviewer. Analyze this resume and provide specific, actionable feedback.

Resume Text:
${normalizedText}

Please provide feedback in JSON format with these keys:
- summaryFeedback: Feedback on the summary/objective section
- experienceFeedback: Feedback on the experience section
- educationFeedback: Feedback on the education section
- skillsFeedback: Feedback on the skills section
- overallFeedback: General improvement suggestions

Keep each feedback concise (2-3 sentences) and actionable.`;

        const feedbackResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a professional resume reviewer. Provide feedback in valid JSON format only.",
            },
            {
              role: "user",
              content: feedbackPrompt,
            },
          ],
        });

        let feedback: any = {};
        try {
          const content = feedbackResponse.choices[0]?.message?.content;
          const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
          feedback = JSON.parse(contentStr);
        } catch (e) {
          console.error("Failed to parse AI feedback:", e);
          feedback = {
            summaryFeedback: "Review your summary for clarity and impact.",
            experienceFeedback: "Highlight quantifiable achievements in your experience.",
            educationFeedback: "Include relevant certifications and coursework.",
            skillsFeedback: "Prioritize skills relevant to your target role.",
            overallFeedback: "Consider tailoring your resume for specific job descriptions.",
          };
        }

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
   * Get all resumes for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userResumes = await getUserResumes(ctx.user.id);
      return userResumes.map((resume) => ({
        id: resume.id,
        fileName: resume.fileName,
        fileType: resume.fileType,
        atsScore: resume.atsScore,
        readabilityScore: resume.readabilityScore,
        skills: resume.skillsExtracted ? JSON.parse(resume.skillsExtracted) : [],
        jobRoles: resume.jobRoleMatches ? JSON.parse(resume.jobRoleMatches) : [],
        createdAt: resume.createdAt,
      }));
    } catch (error) {
      console.error("Failed to list resumes:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch resumes",
      });
    }
  }),

  /**
   * Get resume details with analysis
   */
  getDetails: protectedProcedure
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

        return {
          id: resume.id,
          fileName: resume.fileName,
          fileType: resume.fileType,
          fileUrl: resume.fileUrl,
          extractedText: resume.extractedText,
          atsScore: resume.atsScore,
          readabilityScore: resume.readabilityScore,
          keywordDensity: resume.keywordDensity ? JSON.parse(resume.keywordDensity) : {},
          skills: resume.skillsExtracted ? JSON.parse(resume.skillsExtracted) : [],
          jobRoles: resume.jobRoleMatches ? JSON.parse(resume.jobRoleMatches) : [],
          createdAt: resume.createdAt,
        };
      } catch (error) {
        console.error("Failed to get resume details:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch resume details",
        });
      }
    }),

  /**
   * Delete a resume
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
        console.error("Failed to delete resume:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete resume",
        });
      }
    }),

  /**
   * Analyze resume against job description
   */
  analyzeJobMatch: protectedProcedure
    .input(
      z.object({
        resumeId: z.number(),
        jobDescription: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const resume = await getResumeById(input.resumeId);

        if (!resume || resume.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Resume not found",
          });
        }

        // Extract skills from job description
        const jobSkills = extractSkills(input.jobDescription);
        const resumeSkills = resume.skillsExtracted ? JSON.parse(resume.skillsExtracted) : [];

        // Find matching and missing skills
        const skillMatches = resumeSkills.filter((skill: string) =>
          jobSkills.some((js: string) => js.toLowerCase() === skill.toLowerCase())
        );
        const skillGaps = jobSkills.filter(
          (skill: string) =>
            !resumeSkills.some((rs: string) => rs.toLowerCase() === skill.toLowerCase())
        );

        // Generate AI analysis
        const analysisPrompt = `Compare this resume against the job description and provide a skill gap analysis.

Resume Skills: ${resumeSkills.join(", ")}

Job Description:
${input.jobDescription}

Required Skills: ${jobSkills.join(", ")}

Provide a JSON response with:
- matchPercentage: (0-100) how well the resume matches the job
- skillMatches: array of matched skills
- skillGaps: array of missing skills
- recommendations: array of 3-4 recommendations to improve fit`;

        const analysisResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a career coach analyzing job fit. Respond with valid JSON only.",
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
        });

        let analysis: any = {};
        try {
          const content = analysisResponse.choices[0]?.message?.content;
          const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
          analysis = JSON.parse(contentStr);
        } catch (e) {
          analysis = {
            matchPercentage: 60,
            skillMatches,
            skillGaps,
            recommendations: [
              "Learn the missing technical skills",
              "Highlight transferable skills",
              "Gain relevant project experience",
            ],
          };
        }

        // Update analysis record
        const analysisRecord = await getOrCreateAnalysis(resume.id, ctx.user.id);
        if (analysisRecord) {
          await updateAnalysis(analysisRecord.id, {
            targetJobDescription: input.jobDescription,
            skillMatches: JSON.stringify(analysis.skillMatches || skillMatches),
            skillGaps: JSON.stringify(analysis.skillGaps || skillGaps),
          });
        }

        return {
          matchPercentage: analysis.matchPercentage || 60,
          skillMatches: analysis.skillMatches || skillMatches,
          skillGaps: analysis.skillGaps || skillGaps,
          recommendations: analysis.recommendations || [],
        };
      } catch (error) {
        console.error("Failed to analyze job match:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze job match",
        });
      }
    }),
});
