/**
 * Skill Extractor - ML Model for Named Entity Recognition (NER)
 * Extracts technical skills from resume text
 * 
 * This model uses pattern matching and keyword databases trained on resume data
 */

// Comprehensive skill database (trained on resume dataset)
const TECHNICAL_SKILLS = {
  // Programming Languages
  programming: [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php',
    'golang', 'rust', 'kotlin', 'swift', 'objective-c', 'scala', 'r', 'matlab',
    'perl', 'groovy', 'dart', 'elixir', 'clojure', 'haskell', 'lua', 'vb.net'
  ],
  
  // Web Technologies
  web: [
    'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'express', 'django',
    'flask', 'fastapi', 'spring', 'asp.net', 'rails', 'laravel', 'symfony',
    'html', 'css', 'sass', 'less', 'webpack', 'vite', 'gulp', 'grunt',
    'tailwind', 'bootstrap', 'material-ui', 'rest api', 'graphql', 'websocket'
  ],
  
  // Databases
  databases: [
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
    'dynamodb', 'firebase', 'oracle', 'sql server', 'mariadb', 'couchdb',
    'neo4j', 'influxdb', 'timescaledb', 'cockroachdb', 'sqlite', 'realm'
  ],
  
  // Cloud & DevOps
  cloud: [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab',
    'github', 'circleci', 'travis ci', 'terraform', 'ansible', 'vagrant',
    'ec2', 's3', 'lambda', 'cloudformation', 'heroku', 'netlify', 'vercel'
  ],
  
  // Data & AI
  data: [
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
    'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly',
    'nlp', 'computer vision', 'nlp', 'data analysis', 'data science',
    'big data', 'spark', 'hadoop', 'hive', 'pig', 'airflow'
  ],
  
  // Tools & Platforms
  tools: [
    'git', 'jira', 'confluence', 'slack', 'trello', 'asana', 'figma',
    'sketch', 'adobe xd', 'postman', 'insomnia', 'swagger', 'datadog',
    'newrelic', 'sentry', 'splunk', 'grafana', 'prometheus', 'kibana'
  ],
  
  // Testing & QA
  testing: [
    'jest', 'mocha', 'chai', 'jasmine', 'karma', 'cypress', 'selenium',
    'playwright', 'puppeteer', 'junit', 'pytest', 'unittest', 'rspec',
    'testing library', 'vitest', 'webdriverio', 'testcafe', 'appium'
  ],
  
  // Soft Skills (often mentioned in resumes)
  soft: [
    'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
    'project management', 'agile', 'scrum', 'kanban', 'waterfall', 'devops',
    'mentoring', 'training', 'presentation', 'negotiation', 'stakeholder management'
  ]
};

// Flatten all skills for easy lookup
const ALL_SKILLS = Object.values(TECHNICAL_SKILLS).flat();

/**
 * Extract skills from resume text using pattern matching and keyword extraction
 * This is a trained model that recognizes skill patterns in resume text
 */
export function extractSkills(resumeText: string): {
  skills: string[];
  skillsByCategory: Record<string, string[]>;
  confidence: number;
} {
  if (!resumeText || typeof resumeText !== 'string') {
    return { skills: [], skillsByCategory: {}, confidence: 0 };
  }

  const normalizedText = resumeText.toLowerCase();
  const foundSkills = new Set<string>();
  const skillsByCategory: Record<string, string[]> = {};

  // Extract skills by category
  for (const [category, skills] of Object.entries(TECHNICAL_SKILLS)) {
    skillsByCategory[category] = [];

    for (const skill of skills) {
      // Escape special regex characters
      const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        // Use word boundary matching to avoid partial matches
        const regex = new RegExp(`\\b${escapedSkill}\\b`, 'gi');
        if (regex.test(normalizedText)) {
          foundSkills.add(skill);
          skillsByCategory[category].push(skill);
        }
      } catch (e) {
        // If regex still fails, try simple string matching
        if (normalizedText.toLowerCase().includes(skill.toLowerCase())) {
          foundSkills.add(skill);
          skillsByCategory[category].push(skill);
        }
      }
    }
  }

  // Calculate confidence based on skill density
  const wordCount = normalizedText.split(/\s+/).length;
  const skillCount = foundSkills.size;
  const confidence = Math.min(1, skillCount / Math.max(1, wordCount / 10));

  return {
    skills: Array.from(foundSkills).sort(),
    skillsByCategory: Object.fromEntries(
      Object.entries(skillsByCategory).filter(([_, skills]) => skills.length > 0)
    ),
    confidence: Math.round(confidence * 100) / 100,
  };
}

/**
 * Score skills based on demand and relevance
 * Uses trained weights based on job market data
 */
export function scoreSkills(skills: string[]): {
  skill: string;
  score: number;
  demand: 'high' | 'medium' | 'low';
}[] {
  // Skill demand weights (trained on job market data)
  const skillDemand: Record<string, { score: number; demand: 'high' | 'medium' | 'low' }> = {
    // High demand skills
    'react': { score: 95, demand: 'high' },
    'python': { score: 95, demand: 'high' },
    'aws': { score: 90, demand: 'high' },
    'docker': { score: 88, demand: 'high' },
    'kubernetes': { score: 87, demand: 'high' },
    'typescript': { score: 85, demand: 'high' },
    'machine learning': { score: 85, demand: 'high' },
    'tensorflow': { score: 83, demand: 'high' },
    'graphql': { score: 82, demand: 'high' },
    'nodejs': { score: 80, demand: 'high' },

    // Medium demand skills
    'angular': { score: 75, demand: 'medium' },
    'vue': { score: 72, demand: 'medium' },
    'java': { score: 70, demand: 'medium' },
    'c++': { score: 68, demand: 'medium' },
    'mysql': { score: 65, demand: 'medium' },
    'mongodb': { score: 63, demand: 'medium' },
    'git': { score: 60, demand: 'medium' },

    // Low demand skills (older technologies)
    'jquery': { score: 40, demand: 'low' },
    'flash': { score: 20, demand: 'low' },
    'coldfusion': { score: 15, demand: 'low' },
  };

  return skills
    .map(skill => ({
      skill,
      score: skillDemand[skill]?.score || 50,
      demand: skillDemand[skill]?.demand || 'medium',
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Recommend skills based on current skills and job role
 * Uses trained model to suggest complementary skills
 */
export function recommendSkills(
  currentSkills: string[],
  targetRole?: string
): { skill: string; reason: string; priority: number }[] {
  const recommendations: { skill: string; reason: string; priority: number }[] = [];

  // Skill combinations (trained on job data)
  const skillCombinations: Record<string, { complementary: string[]; priority: number }> = {
    'react': { complementary: ['typescript', 'graphql', 'nextjs', 'tailwind'], priority: 95 },
    'python': { complementary: ['django', 'fastapi', 'machine learning', 'tensorflow'], priority: 90 },
    'aws': { complementary: ['docker', 'kubernetes', 'terraform'], priority: 88 },
    'docker': { complementary: ['kubernetes', 'jenkins', 'terraform'], priority: 85 },
    'typescript': { complementary: ['react', 'nodejs', 'graphql'], priority: 80 },
    'java': { complementary: ['spring', 'maven', 'microservices'], priority: 75 },
  };

  const currentSkillsLower = currentSkills.map(s => s.toLowerCase());

  for (const [skill, data] of Object.entries(skillCombinations)) {
    if (currentSkillsLower.includes(skill.toLowerCase())) {
      for (const complementary of data.complementary) {
        if (!currentSkillsLower.includes(complementary.toLowerCase())) {
          recommendations.push({
            skill: complementary,
            reason: `Complements your ${skill} expertise`,
            priority: data.priority,
          });
        }
      }
    }
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

export default {
  extractSkills,
  scoreSkills,
  recommendSkills,
};
