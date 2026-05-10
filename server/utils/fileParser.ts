import mammoth from "mammoth";
import PDFParser from "pdf2json";

/**
 * Parse PDF file and extract text using pdf2json
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      console.log("Parsing PDF buffer with pdf2json, size:", buffer.length);

      if (!buffer || buffer.length === 0) {
        reject(new Error("Empty PDF buffer"));
        return;
      }

      const pdfParser = new PDFParser(null, false);

      pdfParser.on("pdfParser_dataError", (data: any) => {
        console.error("PDF parsing error:", data);
        reject(new Error(`Failed to parse PDF: ${data.parserError || "Unknown error"}`));
      });

      pdfParser.on("pdfParser_dataReady", (data: any) => {
        try {
          let fullText = "";

          // Extract text from all pages
          if (data.Pages && Array.isArray(data.Pages)) {
            for (const page of data.Pages) {
              if (page.Texts && Array.isArray(page.Texts)) {
                for (const textItem of page.Texts) {
                  if (textItem.R && Array.isArray(textItem.R)) {
                    for (const run of textItem.R) {
                      if (run.T) {
                        // Decode the text (it's URL encoded)
                        fullText += decodeURIComponent(run.T) + " ";
                      }
                    }
                  }
                }
              }
              fullText += "\n";
            }
          }

          console.log("PDF parsed successfully, text length:", fullText.length);

          if (!fullText || fullText.trim().length === 0) {
            console.warn("No text extracted from PDF");
            resolve("Resume content could not be extracted from PDF. Please ensure the PDF contains selectable text.");
          } else {
            resolve(fullText);
          }
        } catch (error) {
          console.error("Error processing PDF data:", error);
          reject(new Error(`Failed to process PDF data: ${error instanceof Error ? error.message : String(error)}`));
        }
      });

      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      console.error("PDF parsing error:", error);
      reject(new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : String(error)}`));
    }
  });
}

/**
 * Parse DOCX file and extract text
 */
export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    console.log("Parsing DOCX buffer, size:", buffer.length);

    if (!buffer || buffer.length === 0) {
      throw new Error("Empty DOCX buffer");
    }

    const result = await mammoth.extractRawText({ buffer });
    console.log("DOCX parsed successfully, text length:", result.value?.length || 0);

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("No text extracted from DOCX");
    }

    return result.value;
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error(`Failed to parse DOCX file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extract text from resume file based on file type
 */
export async function extractResumeText(
  buffer: Buffer,
  fileType: "pdf" | "docx"
): Promise<string> {
  if (fileType === "pdf") {
    return parsePDF(buffer);
  } else if (fileType === "docx") {
    return parseDOCX(buffer);
  } else {
    throw new Error("Unsupported file type");
  }
}

/**
 * Clean and normalize extracted text
 */
export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n+/g, "\n") // Replace multiple newlines with single newline
    .trim();
}

/**
 * Extract skills from resume text using keyword matching
 */
export function extractSkills(text: string): string[] {
  const commonSkills = [
    // Programming Languages
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "R",
    "MATLAB",
    "SQL",
    "HTML",
    "CSS",
    "Scala",
    "Perl",
    "Groovy",

    // Frontend Frameworks
    "React",
    "Vue",
    "Angular",
    "Svelte",
    "Next.js",
    "Nuxt",
    "Ember",
    "Backbone",
    "jQuery",
    "Bootstrap",
    "Tailwind",

    // Backend Frameworks
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "FastAPI",
    "Spring",
    "Spring Boot",
    "Laravel",
    "ASP.NET",
    "Ruby on Rails",
    "Fastify",
    "Nest.js",

    // Databases
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Elasticsearch",
    "Firebase",
    "DynamoDB",
    "Cassandra",
    "Oracle",
    "SQLite",
    "MariaDB",

    // Cloud & DevOps
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Jenkins",
    "GitLab",
    "GitHub",
    "Terraform",
    "Ansible",

    // Tools & Platforms
    "Git",
    "Linux",
    "Windows",
    "macOS",
    "Jira",
    "Slack",
    "Figma",
    "Photoshop",
    "Illustrator",
    "Sketch",

    // Data & AI
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "Data Analysis",
    "Big Data",
    "Spark",
    "Hadoop",
    "AI",
    "NLP",
    "Computer Vision",
  ];

  const textLower = text.toLowerCase();
  const foundSkills = new Set<string>();

  for (const skill of commonSkills) {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
}

/**
 * Suggest job roles based on resume content and skills
 */
export function suggestJobRoles(text: string, skills: string[]): string[] {
  const jobRoles = [
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Cloud Architect",
    "Systems Engineer",
    "QA Engineer",
    "Product Manager",
    "Tech Lead",
    "Solutions Architect",
  ];

  const textLower = text.toLowerCase();
  const suggestedRoles: string[] = [];

  // Check for role keywords
  const roleKeywords: Record<string, string[]> = {
    "Full Stack Developer": ["full stack", "frontend", "backend", "react", "node", "database"],
    "Frontend Developer": ["frontend", "react", "vue", "angular", "css", "html", "ui", "ux"],
    "Backend Developer": ["backend", "api", "server", "database", "node", "python", "java"],
    "Mobile Developer": ["mobile", "ios", "android", "react native", "flutter", "swift"],
    "DevOps Engineer": ["devops", "docker", "kubernetes", "ci/cd", "jenkins", "aws"],
    "Data Scientist": ["data science", "machine learning", "python", "pandas", "tensorflow"],
    "Machine Learning Engineer": ["machine learning", "deep learning", "pytorch", "tensorflow", "ai"],
    "Cloud Architect": ["cloud", "aws", "azure", "gcp", "infrastructure", "architecture"],
    "Systems Engineer": ["systems", "linux", "windows", "infrastructure", "networking"],
    "QA Engineer": ["qa", "testing", "test automation", "selenium", "quality"],
  };

  for (const [role, keywords] of Object.entries(roleKeywords)) {
    const matchCount = keywords.filter((keyword) => textLower.includes(keyword.toLowerCase())).length;
    if (matchCount >= 2 || (matchCount === 1 && skills.length > 0)) {
      suggestedRoles.push(role);
    }
  }

  // If no roles matched, suggest based on skills
  if (suggestedRoles.length === 0) {
    if (skills.some((s) => ["React", "Vue", "Angular"].includes(s))) {
      suggestedRoles.push("Frontend Developer");
    }
    if (skills.some((s) => ["Node.js", "Python", "Java"].includes(s))) {
      suggestedRoles.push("Backend Developer");
    }
    if (skills.some((s) => ["Docker", "Kubernetes", "AWS"].includes(s))) {
      suggestedRoles.push("DevOps Engineer");
    }
  }

  return suggestedRoles.slice(0, 5); // Return top 5 suggestions
}
