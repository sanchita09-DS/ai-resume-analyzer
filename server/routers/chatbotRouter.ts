/**
 * AI Chatbot router for interactive resume feedback
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getResumeById } from "../db.resumes";
import { addChatMessage, getChatHistory } from "../db.resumes";
// ML Models (replacing LLM API)
import * as chatbotIntent from "../ml/chatbotIntent";
import * as skillExtractor from "../ml/skillExtractor";

export const chatbotRouter = router({
  /**
   * Send a message to the AI chatbot with resume context
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        resumeId: z.number(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify resume ownership
        const resume = await getResumeById(input.resumeId);
        if (!resume || resume.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Resume not found",
          });
        }

        // Get chat history
        const history = await getChatHistory(input.resumeId);

        // Save user message
        await addChatMessage(input.resumeId, ctx.user.id, "user", input.message);

        // Build context for the LLM
        const systemPrompt = `You are an expert resume coach and career advisor. You have access to the user's resume and are helping them improve it.

Resume Content:
${resume.extractedText}

Resume Scores:
- ATS Score: ${resume.atsScore}/100
- Readability Score: ${resume.readabilityScore}/100

Extracted Skills: ${resume.skillsExtracted ? JSON.parse(resume.skillsExtracted).join(", ") : "None"}

Your role is to:
1. Provide specific, actionable feedback on their resume
2. Answer questions about resume optimization
3. Suggest improvements for different sections
4. Help with job-specific tailoring
5. Offer career advice related to their resume

Be conversational, encouraging, and specific. Reference actual content from their resume when providing feedback.`;

        // Build message history for context
        const messages: any[] = [
          {
            role: "system",
            content: systemPrompt,
          },
        ];

        // Add previous chat history (limit to last 10 messages for context)
        const recentHistory = history.slice(-10);
        for (const msg of recentHistory) {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }

        // Add current user message
        messages.push({
          role: "user",
          content: input.message,
        });

        // Get AI response using trained ML models (NO API CALLS)
        const intentMatch = chatbotIntent.classifyIntent(input.message);
        const resumeSkills = resume.skillsExtracted ? JSON.parse(resume.skillsExtracted) : [];
        
        const mlResponse = chatbotIntent.generateResponse(intentMatch.intent, {
          skills: resumeSkills,
          experience: resume.extractedText || '',
          education: resume.extractedText || '',
        });
        
        const assistantMessage = mlResponse.response;

        // Save assistant message
        await addChatMessage(input.resumeId, ctx.user.id, "assistant", assistantMessage);

        return {
          message: assistantMessage,
          success: true,
        };
      } catch (error) {
        console.error("Chatbot error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to process message",
        });
      }
    }),

  /**
   * Get chat history for a resume
   */
  getHistory: protectedProcedure
    .input(z.object({ resumeId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify resume ownership
        const resume = await getResumeById(input.resumeId);
        if (!resume || resume.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Resume not found",
          });
        }

        const history = await getChatHistory(input.resumeId);
        return history.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        }));
      } catch (error) {
        console.error("Failed to get chat history:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat history",
        });
      }
    }),

  /**
   * Analyze skill gaps against job description
   */
  analyzeSkillGaps: protectedProcedure
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

        // Extract skills from both resume and job description
        const resumeSkills = resume.skillsExtracted ? JSON.parse(resume.skillsExtracted) : [];
        const jobSkills = skillExtractor.extractSkills(input.jobDescription);

        // Find skill gaps
        const resumeSkillsLower = resumeSkills.map((s: string) => s.toLowerCase());
        const missingSkills = jobSkills.skills.filter(
          skill => !resumeSkillsLower.includes(skill.toLowerCase())
        );

        const matchingSkills = jobSkills.skills.filter(
          skill => resumeSkillsLower.includes(skill.toLowerCase())
        );

        // Score the match
        const matchPercentage = Math.round((matchingSkills.length / Math.max(1, jobSkills.skills.length)) * 100);

        return {
          success: true,
          matchPercentage,
          matchingSkills,
          missingSkills,
          recommendations: skillExtractor.recommendSkills(resumeSkills),
        };
      } catch (error) {
        console.error("Failed to analyze skill gaps:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to analyze skill gaps",
        });
      }
    }),
});
