/**
 * Cover letter and LinkedIn optimization generation router
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getResumeById } from "../db.resumes";
import { saveGeneratedContent, getGeneratedContent } from "../db.resumes";
import { invokeLLM } from "../_core/llm";

export const generationRouter = router({
  /**
   * Generate a tailored cover letter
   */
  generateCoverLetter: protectedProcedure
    .input(
      z.object({
        resumeId: z.number(),
        jobDescription: z.string(),
        companyName: z.string().optional(),
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

        const prompt = `Generate a professional, compelling cover letter based on this resume and job description.

Resume:
${resume.extractedText}

Job Description:
${input.jobDescription}

${input.companyName ? `Company Name: ${input.companyName}` : ""}

Requirements:
- 3-4 paragraphs
- Professional tone
- Specific examples from the resume
- Address key requirements from the job description
- Include a strong opening and closing
- Format as plain text (no markdown)`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert cover letter writer. Generate a professional, tailored cover letter.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const coverLetter = typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0]?.message?.content
          : JSON.stringify(response.choices[0]?.message?.content);

        // Save generated content
        await saveGeneratedContent(
          resume.id,
          ctx.user.id,
          "coverLetter",
          coverLetter,
          input.jobDescription
        );

        return {
          coverLetter,
          success: true,
        };
      } catch (error) {
        console.error("Cover letter generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate cover letter",
        });
      }
    }),

  /**
   * Generate LinkedIn headline suggestions
   */
  generateLinkedInHeadline: protectedProcedure
    .input(
      z.object({
        resumeId: z.number(),
        targetRole: z.string().optional(),
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

        const prompt = `Based on this resume, generate 5 compelling LinkedIn headline options.

Resume:
${resume.extractedText}

${input.targetRole ? `Target Role: ${input.targetRole}` : ""}

Requirements:
- Each headline should be 120 characters or less
- Include relevant keywords
- Highlight unique value proposition
- Professional and engaging
- Format as a JSON array of strings

Return ONLY a JSON array like: ["headline1", "headline2", ...]`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a LinkedIn expert. Generate compelling headline options. Return ONLY valid JSON array.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        let headlines: string[] = [];
        try {
          const content = typeof response.choices[0]?.message?.content === 'string'
            ? response.choices[0]?.message?.content
            : JSON.stringify(response.choices[0]?.message?.content);
          headlines = JSON.parse(content);
        } catch (e) {
          headlines = [
            "Experienced Professional | Problem Solver | Passionate About Growth",
            "Tech-Savvy Professional | Driving Innovation & Results",
            "Results-Oriented Professional | Delivering Excellence",
          ];
        }

        const headlineText = headlines.join("\n");
        await saveGeneratedContent(resume.id, ctx.user.id, "linkedinHeadline", headlineText);

        return {
          headlines,
          success: true,
        };
      } catch (error) {
        console.error("LinkedIn headline generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate LinkedIn headlines",
        });
      }
    }),

  /**
   * Generate LinkedIn summary suggestions
   */
  generateLinkedInSummary: protectedProcedure
    .input(
      z.object({
        resumeId: z.number(),
        tone: z.enum(["professional", "creative", "casual"]).optional(),
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

        const prompt = `Based on this resume, generate an optimized LinkedIn summary.

Resume:
${resume.extractedText}

Tone: ${input.tone || "professional"}

Requirements:
- 2-4 paragraphs
- Highlight key achievements and skills
- Include a call-to-action
- Use first person
- Incorporate relevant keywords
- Make it engaging and authentic
- Format as plain text`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a LinkedIn profile expert. Generate a compelling, optimized summary.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const summary = typeof response.choices[0]?.message?.content === 'string'
          ? response.choices[0]?.message?.content
          : JSON.stringify(response.choices[0]?.message?.content);

        await saveGeneratedContent(resume.id, ctx.user.id, "linkedinSummary", summary);

        return {
          summary,
          success: true,
        };
      } catch (error) {
        console.error("LinkedIn summary generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate LinkedIn summary",
        });
      }
    }),

  /**
   * Generate LinkedIn skills section suggestions
   */
  generateLinkedInSkills: protectedProcedure
    .input(
      z.object({
        resumeId: z.number(),
        targetRole: z.string().optional(),
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

        const skills = resume.skillsExtracted ? JSON.parse(resume.skillsExtracted) : [];

        const prompt = `Based on this resume and skills, generate optimized LinkedIn skills recommendations.

Resume:
${resume.extractedText}

Current Skills: ${skills.join(", ")}

${input.targetRole ? `Target Role: ${input.targetRole}` : ""}

Requirements:
- Suggest 15-20 relevant skills
- Prioritize high-demand skills
- Include both technical and soft skills
- Organize by category if possible
- Return as JSON object with categories as keys and skill arrays as values

Example format: {"Technical": ["skill1", "skill2"], "Soft Skills": ["skill3", "skill4"]}`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a LinkedIn expert. Generate optimized skills recommendations. Return ONLY valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        let skillsData: Record<string, string[]> = {};
        try {
          const content = typeof response.choices[0]?.message?.content === 'string'
            ? response.choices[0]?.message?.content
            : JSON.stringify(response.choices[0]?.message?.content);
          skillsData = JSON.parse(content);
        } catch (e) {
          skillsData = {
            "Technical": skills.slice(0, 10),
            "Soft Skills": ["Communication", "Leadership", "Problem Solving", "Teamwork"],
          };
        }

        const skillsText = JSON.stringify(skillsData);
        await saveGeneratedContent(resume.id, ctx.user.id, "linkedinSkills", skillsText);

        return {
          skills: skillsData,
          success: true,
        };
      } catch (error) {
        console.error("LinkedIn skills generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate LinkedIn skills",
        });
      }
    }),

  /**
   * Get previously generated content
   */
  getGenerated: protectedProcedure
    .input(
      z.object({
        resumeId: z.number(),
        contentType: z.enum(["coverLetter", "linkedinHeadline", "linkedinSummary", "linkedinSkills"]),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const resume = await getResumeById(input.resumeId);
        if (!resume || resume.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Resume not found",
          });
        }

        const content = await getGeneratedContent(input.resumeId, input.contentType);
        return content || null;
      } catch (error) {
        console.error("Failed to get generated content:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch generated content",
        });
      }
    }),
});
