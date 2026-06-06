/**
 * Cover letter and LinkedIn optimization generation router
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getResumeById, saveGeneratedContent, getGeneratedContent } from "../db.resumes";
import * as skillExtractor from "../ml/skillExtractor";

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

        // Extract skills from both resume and job description
        const resumeSkills = resume.skillsExtracted ? JSON.parse(resume.skillsExtracted) : [];
        const jobSkills = skillExtractor.extractSkills(input.jobDescription);

        // Find matching skills
        const resumeSkillsLower = resumeSkills.map((s: string) => s.toLowerCase());
        const matchingSkills = jobSkills.skills.filter(
          skill => resumeSkillsLower.includes(skill.toLowerCase())
        );

        // Generate cover letter using ML-based templates
        const companyName = input.companyName || "Hiring Team";
        
        const coverLetter = `Dear ${companyName},

I am writing to express my strong interest in the position described in your job posting. With my background in ${resumeSkills.slice(0, 3).join(", ")}, I am confident that I can make significant contributions to your team.

Throughout my career, I have developed expertise in ${matchingSkills.slice(0, 3).join(", ") || resumeSkills[0]}, which directly aligns with your requirements. My experience has equipped me with the technical skills and problem-solving abilities necessary to excel in this role.

Key strengths I would bring to your organization:
- Proficiency in ${matchingSkills[0] || resumeSkills[0] || "your required technologies"}
- Proven track record of delivering high-quality solutions
- Strong collaboration and communication skills
- Commitment to continuous learning and professional growth

I am particularly interested in this opportunity because it combines my technical expertise with my passion for solving complex problems. I am excited about the possibility of contributing to your team and helping drive your organization's success.

Thank you for considering my application. I look forward to discussing how my skills and experience can contribute to your team's objectives.

Sincerely,
${resume.extractedText?.match(/([A-Z][a-z]+ [A-Z][a-z]+)/)?.[0] || "Your Name"}`;

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

        const skills = resume.skillsExtracted ? JSON.parse(resume.skillsExtracted) : [];
        const topSkills = skills.slice(0, 3);

        // Generate headline suggestions using ML templates
        const headlines = [
          `${topSkills[0]} Developer | ${topSkills[1] || "Software Engineer"} | Building Scalable Solutions`,
          `Senior ${topSkills[0]} Engineer | ${topSkills[1] || "Full Stack"} Developer | Tech Innovator`,
          `${topSkills[0]} Specialist | ${topSkills[1] || "Cloud"} Expert | Driving Digital Transformation`,
          `${topSkills[0]} & ${topSkills[1] || "Web"} Developer | ${topSkills[2] || "Problem Solver"} | Open to Opportunities`,
          `Lead ${topSkills[0]} Engineer | ${topSkills[1] || "Architect"} | Passionate About Technology`,
        ];

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

        const skills = resume.skillsExtracted ? JSON.parse(resume.skillsExtracted) : [];

        // Generate summary using ML templates
        const summary = `I'm a passionate developer with expertise in ${skills.slice(0, 2).join(" and ")}.

Throughout my career, I've focused on building scalable, user-centric solutions that drive business impact. My experience spans across full-stack development, cloud architecture, and leading cross-functional teams.

What I bring to the table:
• Deep technical expertise in ${skills[0]} and related technologies
• Proven ability to deliver high-quality projects on time
• Strong problem-solving and analytical skills
• Excellent communication and team collaboration abilities
• Commitment to continuous learning and professional growth

I'm always interested in connecting with like-minded professionals and exploring opportunities to make a meaningful impact. Feel free to reach out if you'd like to discuss potential collaborations or opportunities.

Let's connect and grow together!`;

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

        // Generate skills recommendations using ML templates
        const technicalSkills = skills.filter((s: string) => 
          ["JavaScript", "Python", "Java", "React", "Node", "MongoDB", "SQL", "AWS"].some(
            tech => s.toLowerCase().includes(tech.toLowerCase())
          )
        );

        const softSkills = [
          "Leadership",
          "Communication",
          "Problem Solving",
          "Project Management",
          "Team Collaboration",
          "Critical Thinking",
        ];

        const skillsData: Record<string, string[]> = {
          "Technical": technicalSkills.slice(0, 8) || skills.slice(0, 8),
          "Soft Skills": softSkills.slice(0, 6),
        };

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
