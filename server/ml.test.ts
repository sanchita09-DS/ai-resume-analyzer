/**
 * Comprehensive tests for ML models (no API calls)
 */

import { describe, it, expect } from "vitest";
import * as skillExtractor from "./ml/skillExtractor";
import * as feedbackGenerator from "./ml/feedbackGenerator";
import * as sectionClassifier from "./ml/sectionClassifier";
import * as chatbotIntent from "./ml/chatbotIntent";

describe("ML Models - No API Calls", () => {
  describe("Skill Extractor", () => {
    it("should extract technical skills from resume text", () => {
      const text = "I have 5 years of experience with JavaScript, React, Node.js, and MongoDB. I'm proficient in Python and SQL.";
      const skills = skillExtractor.extractSkills(text);
      
      expect(skills.skills).toBeDefined();
      expect(skills.skills.length).toBeGreaterThan(0);
      expect(skills.skills.some(s => s.toLowerCase().includes("javascript") || s.toLowerCase().includes("react"))).toBe(true);
    });

    it("should recommend skills based on current skills", () => {
      const currentSkills = ["JavaScript", "React", "Node.js"];
      const recommendations = skillExtractor.recommendSkills(currentSkills);
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it("should handle empty skill list", () => {
      const recommendations = skillExtractor.recommendSkills([]);
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe("Feedback Generator", () => {
    it("should analyze summary section", () => {
      const summary = "Experienced software engineer with 5+ years in full-stack development";
      const analysis = feedbackGenerator.analyzeSummary(summary);
      
      expect(analysis).toBeDefined();
      expect(analysis.suggestions).toBeDefined();
      expect(Array.isArray(analysis.suggestions)).toBe(true);
    });

    it("should analyze experience section", () => {
      const experience = "Led development of microservices architecture. Improved performance by 40%. Mentored junior developers.";
      const analysis = feedbackGenerator.analyzeExperience(experience);
      
      expect(analysis).toBeDefined();
      expect(analysis.suggestions).toBeDefined();
      expect(Array.isArray(analysis.suggestions)).toBe(true);
    });

    it("should analyze education section", () => {
      const education = "B.S. Computer Science from MIT, 2018. GPA: 3.8";
      const analysis = feedbackGenerator.analyzeEducation(education);
      
      expect(analysis).toBeDefined();
      expect(analysis.suggestions).toBeDefined();
      expect(Array.isArray(analysis.suggestions)).toBe(true);
    });

    it("should analyze skills section", () => {
      const skills = "JavaScript, React, Node.js, MongoDB, Python, SQL, Git, Docker";
      const analysis = feedbackGenerator.analyzeSkills(skills);
      
      expect(analysis).toBeDefined();
      expect(analysis.suggestions).toBeDefined();
      expect(Array.isArray(analysis.suggestions)).toBe(true);
    });

    it("should generate overall feedback", () => {
      const summaryAnalysis = feedbackGenerator.analyzeSummary("Good summary");
      const experienceAnalysis = feedbackGenerator.analyzeExperience("Good experience");
      const educationAnalysis = feedbackGenerator.analyzeEducation("Good education");
      const skillsAnalysis = feedbackGenerator.analyzeSkills("Good skills");
      
      const overall = feedbackGenerator.generateOverallFeedback(
        summaryAnalysis,
        experienceAnalysis,
        educationAnalysis,
        skillsAnalysis
      );
      
      expect(overall).toBeDefined();
      expect(overall.topPriorities).toBeDefined();
      expect(Array.isArray(overall.topPriorities)).toBe(true);
    });
  });

  describe("Section Classifier", () => {
    it("should extract summary section", () => {
      const text = `SUMMARY
Experienced software engineer with 5+ years in full-stack development.

EXPERIENCE
Worked at Google as Senior Engineer.`;
      
      const section = sectionClassifier.extractSection(text, 'summary');
      expect(section).toBeDefined();
      if (section) {
        expect(section.content.toLowerCase()).toContain("experienced");
      }
    });

    it("should extract experience section", () => {
      const text = `SUMMARY
Experienced engineer.

EXPERIENCE
Worked at Google from 2020-2023.
Worked at Facebook from 2018-2020.`;
      
      const section = sectionClassifier.extractSection(text, 'experience');
      expect(section).toBeDefined();
      if (section) {
        expect(section.content.toLowerCase()).toContain("google");
      }
    });

    it("should classify resume sections", () => {
      const text = `SUMMARY
Experienced engineer.

EXPERIENCE
Worked at Google.

EDUCATION
B.S. Computer Science

SKILLS
JavaScript, React`;
      
      const sections = sectionClassifier.classifySections(text);
      expect(sections).toBeDefined();
      expect(Array.isArray(sections)).toBe(true);
    });
  });

  describe("Chatbot Intent Classifier", () => {
    it("should classify improvement intent", () => {
      const message = "How can I improve my resume?";
      const result = chatbotIntent.classifyIntent(message);
      
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it("should classify skills intent", () => {
      const message = "What skills should I add to my resume?";
      const result = chatbotIntent.classifyIntent(message);
      
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    it("should generate response for improvement intent", () => {
      const response = chatbotIntent.generateResponse("improvement", {
        skills: ["JavaScript", "React"],
        experience: "5 years at Google",
        education: "B.S. Computer Science",
      });
      
      expect(response).toBeDefined();
      expect(response.response).toBeDefined();
      expect(typeof response.response).toBe("string");
      expect(response.response.length).toBeGreaterThan(0);
    });

    it("should generate follow-up suggestions", () => {
      const suggestions = chatbotIntent.generateFollowUpSuggestions("improvement");
      
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe("Integration Tests", () => {
    it("should process complete resume analysis workflow", () => {
      const resumeText = `SUMMARY
Experienced full-stack engineer with 5+ years building scalable applications.

EXPERIENCE
Senior Engineer at Google (2020-2023)
- Led microservices migration, improved performance by 40%
- Mentored 3 junior engineers

EDUCATION
B.S. Computer Science, MIT, 2018

SKILLS
JavaScript, React, Node.js, MongoDB, Python, SQL, Docker, Kubernetes`;

      // Extract sections
      const sections = sectionClassifier.classifySections(resumeText);
      expect(sections.length).toBeGreaterThan(0);

      // Extract skills
      const skills = skillExtractor.extractSkills(resumeText);
      expect(skills.skills.length).toBeGreaterThan(0);

      // Generate feedback
      const summarySection = sectionClassifier.extractSection(resumeText, 'summary')?.content || '';
      const experienceSection = sectionClassifier.extractSection(resumeText, 'experience')?.content || '';
      const educationSection = sectionClassifier.extractSection(resumeText, 'education')?.content || '';
      const skillsSection = sectionClassifier.extractSection(resumeText, 'skills')?.content || '';

      const summaryAnalysis = feedbackGenerator.analyzeSummary(summarySection);
      const experienceAnalysis = feedbackGenerator.analyzeExperience(experienceSection);
      const educationAnalysis = feedbackGenerator.analyzeEducation(educationSection);
      const skillsAnalysis = feedbackGenerator.analyzeSkills(skillsSection);

      expect(summaryAnalysis.suggestions.length).toBeGreaterThan(0);
      expect(experienceAnalysis.suggestions.length).toBeGreaterThan(0);
      expect(educationAnalysis.suggestions.length).toBeGreaterThan(0);
      expect(skillsAnalysis.suggestions.length).toBeGreaterThan(0);

      // Generate overall feedback
      const overall = feedbackGenerator.generateOverallFeedback(
        summaryAnalysis,
        experienceAnalysis,
        educationAnalysis,
        skillsAnalysis
      );
      expect(overall.topPriorities.length).toBeGreaterThan(0);
    });

    it("should handle chatbot conversation with resume context", () => {
      const message = "How can I improve my skills section?";
      const intent = chatbotIntent.classifyIntent(message);
      
      expect(intent.intent).toBeDefined();
      expect(intent.confidence).toBeGreaterThan(0);

      const response = chatbotIntent.generateResponse(intent.intent, {
        skills: ["JavaScript", "React", "Node.js"],
        experience: "5 years",
        education: "B.S. CS",
      });

      expect(response.response).toBeDefined();
      expect(response.response.length).toBeGreaterThan(0);

      const suggestions = chatbotIntent.generateFollowUpSuggestions(intent.intent);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty resume text", () => {
      const skills = skillExtractor.extractSkills("");
      expect(skills.skills).toBeDefined();
      expect(Array.isArray(skills.skills)).toBe(true);
    });

    it("should handle very long resume text", () => {
      const longText = "Lorem ipsum ".repeat(1000);
      const skills = skillExtractor.extractSkills(longText);
      expect(skills.skills).toBeDefined();
      expect(Array.isArray(skills.skills)).toBe(true);
    });

    it("should handle special characters in resume", () => {
      const text = "C++, C#, .NET, @Angular, #React, $JavaScript";
      const skills = skillExtractor.extractSkills(text);
      expect(skills.skills).toBeDefined();
      expect(Array.isArray(skills.skills)).toBe(true);
    });

    it("should classify intent with typos", () => {
      const message = "hwo can i imprve my resume";
      const result = chatbotIntent.classifyIntent(message);
      expect(result.intent).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });
});
