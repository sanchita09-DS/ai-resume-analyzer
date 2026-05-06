import mammoth from "mammoth";

// Use require for pdf-parse due to ESM/CJS compatibility
// Use dynamic import to handle pdf-parse ESM/CJS compatibility
let pdfParseModule: any;

async function getPdfParser() {
  if (!pdfParseModule) {
    try {
      pdfParseModule = await import("pdf-parse");
    } catch {
      // Fallback for CJS
      pdfParseModule = require("pdf-parse");
    }
  }
  return pdfParseModule.default || pdfParseModule;
}

/**
 * Parse PDF file and extract text
 */
export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = await getPdfParser();
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF file");
  }
}

/**
 * Parse DOCX file and extract text
 */
export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to parse DOCX file");
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
    "Express",
    "Django",
    "Flask",
    "Spring",
    "Laravel",
    "Rails",
    "ASP.NET",
    "FastAPI",
    "NestJS",
    "Fastify",

    // Databases
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Cassandra",
    "DynamoDB",
    "Firebase",
    "Oracle",
    "SQL Server",
    "Elasticsearch",

    // Cloud & DevOps
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Jenkins",
    "GitLab CI",
    "GitHub Actions",
    "Terraform",
    "Ansible",
    "CloudFormation",

    // Data & Analytics
    "Tableau",
    "Power BI",
    "Looker",
    "Apache Spark",
    "Hadoop",
    "ETL",
    "Data Warehouse",
    "BigQuery",
    "Snowflake",
    "Airflow",

    // AI/ML
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "Scikit-learn",
    "NLP",
    "Computer Vision",
    "Neural Networks",
    "Keras",

    // Other Tools
    "Git",
    "GitHub",
    "GitLab",
    "Jira",
    "Agile",
    "Scrum",
    "REST API",
    "GraphQL",
    "Microservices",
    "CI/CD",
    "Linux",
    "Windows",
    "macOS",
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
 * Extract job roles from resume text
 */
export function suggestJobRoles(text: string, skills: string[]): string[] {
  const textLower = text.toLowerCase();

  const rolePatterns: Record<string, { keywords: string[]; weight: number }> = {
    "Full Stack Developer": {
      keywords: [
        "full stack",
        "frontend",
        "backend",
        "react",
        "node",
        "express",
        "database",
      ],
      weight: 0,
    },
    "Frontend Developer": {
      keywords: [
        "frontend",
        "react",
        "vue",
        "angular",
        "ui",
        "ux",
        "html",
        "css",
        "javascript",
      ],
      weight: 0,
    },
    "Backend Developer": {
      keywords: [
        "backend",
        "api",
        "server",
        "database",
        "python",
        "java",
        "node",
        "microservices",
      ],
      weight: 0,
    },
    "DevOps Engineer": {
      keywords: [
        "devops",
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "ci/cd",
        "jenkins",
        "infrastructure",
      ],
      weight: 0,
    },
    "Data Scientist": {
      keywords: [
        "data science",
        "machine learning",
        "python",
        "tensorflow",
        "analytics",
        "statistics",
        "deep learning",
      ],
      weight: 0,
    },
    "Data Engineer": {
      keywords: [
        "data engineer",
        "etl",
        "spark",
        "hadoop",
        "data warehouse",
        "pipeline",
        "bigquery",
      ],
      weight: 0,
    },
    "QA Engineer": {
      keywords: [
        "qa",
        "testing",
        "automation",
        "selenium",
        "test",
        "quality assurance",
      ],
      weight: 0,
    },
    "Product Manager": {
      keywords: [
        "product manager",
        "product",
        "strategy",
        "roadmap",
        "stakeholder",
        "agile",
      ],
      weight: 0,
    },
  };

  // Calculate weights based on keyword matches
  for (const role in rolePatterns) {
    for (const keyword of rolePatterns[role].keywords) {
      if (textLower.includes(keyword.toLowerCase())) {
        rolePatterns[role].weight += 1;
      }
    }
  }

  // Sort by weight and return top 3
  return Object.entries(rolePatterns)
    .filter(([, pattern]) => pattern.weight > 0)
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 3)
    .map(([role]) => role);
}
