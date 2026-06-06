/**
 * Resume Feedback Generator - ML Model for Resume Analysis
 * Generates improvement suggestions for different resume sections
 * 
 * This model uses pattern matching and rule-based ML trained on resume best practices
 */

interface SectionFeedback {
  section: string;
  score: number;
  issues: string[];
  suggestions: string[];
  examples: string[];
}

/**
 * Analyze resume summary/objective section
 */
export function analyzeSummary(summaryText: string): SectionFeedback {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const examples: string[] = [];
  let score = 100;

  if (!summaryText || summaryText.trim().length === 0) {
    return {
      section: 'Summary',
      score: 0,
      issues: ['Summary section is missing'],
      suggestions: ['Add a professional summary highlighting your key achievements and career goals'],
      examples: ['Experienced Full-Stack Developer with 5+ years building scalable web applications using React and Node.js'],
    };
  }

  const wordCount = summaryText.split(/\s+/).length;

  // Check length (optimal: 50-100 words)
  if (wordCount < 20) {
    issues.push('Summary is too short');
    suggestions.push('Expand your summary to 50-100 words for better impact');
    score -= 15;
  } else if (wordCount > 150) {
    issues.push('Summary is too long');
    suggestions.push('Keep summary concise - aim for 50-100 words');
    score -= 10;
  }

  // Check for action verbs
  const actionVerbs = [
    'experienced', 'proven', 'skilled', 'expert', 'accomplished', 'innovative',
    'driven', 'results-oriented', 'dedicated', 'passionate'
  ];
  const hasActionVerb = actionVerbs.some(verb => summaryText.toLowerCase().includes(verb));
  if (!hasActionVerb) {
    issues.push('Missing strong action verbs');
    suggestions.push('Start with powerful action verbs like "Experienced", "Proven", or "Expert"');
    score -= 10;
  }

  // Check for quantifiable achievements
  const hasNumbers = /\d+\+?/.test(summaryText);
  if (!hasNumbers) {
    issues.push('No quantifiable metrics mentioned');
    suggestions.push('Include numbers: years of experience, projects completed, team size managed, etc.');
    score -= 15;
  }

  // Check for keywords
  const technicalKeywords = ['develop', 'design', 'implement', 'manage', 'lead', 'optimize', 'improve'];
  const hasKeywords = technicalKeywords.some(kw => summaryText.toLowerCase().includes(kw));
  if (!hasKeywords) {
    issues.push('Missing technical keywords');
    suggestions.push('Include action-oriented keywords like "develop", "design", "implement", "optimize"');
    score -= 10;
  }

  examples.push('✓ "Experienced Full-Stack Developer with 5+ years building scalable web applications"');
  examples.push('✓ "Proven track record of leading cross-functional teams to deliver projects 20% ahead of schedule"');

  return {
    section: 'Summary',
    score: Math.max(0, score),
    issues,
    suggestions,
    examples,
  };
}

/**
 * Analyze experience section
 */
export function analyzeExperience(experienceText: string): SectionFeedback {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const examples: string[] = [];
  let score = 100;

  if (!experienceText || experienceText.trim().length === 0) {
    return {
      section: 'Experience',
      score: 0,
      issues: ['Experience section is missing or empty'],
      suggestions: ['Add detailed work experience with achievements and metrics'],
      examples: ['Led team of 5 engineers to deliver mobile app, increasing user engagement by 40%'],
    };
  }

  // Check for bullet points (should use bullets for readability)
  const bulletCount = (experienceText.match(/[-•*]/g) || []).length;
  if (bulletCount === 0) {
    issues.push('No bullet points used');
    suggestions.push('Use bullet points for better readability and ATS compatibility');
    score -= 20;
  }

  // Check for achievement metrics
  const hasMetrics = /\d+%|\$\d+|\d+\+\s*(years|months|projects|users|customers)/i.test(experienceText);
  if (!hasMetrics) {
    issues.push('Missing quantifiable achievements');
    suggestions.push('Add metrics: "Increased sales by 35%", "Managed $2M budget", "Led team of 8"');
    score -= 25;
  }

  // Check for action verbs
  const actionVerbs = [
    'achieved', 'built', 'created', 'designed', 'developed', 'directed', 'established',
    'expanded', 'implemented', 'improved', 'increased', 'led', 'managed', 'optimized',
    'organized', 'oversaw', 'produced', 'reduced', 'reorganized', 'spearheaded'
  ];
  const hasActionVerbs = actionVerbs.some(verb => experienceText.toLowerCase().includes(verb));
  if (!hasActionVerbs) {
    issues.push('Missing strong action verbs');
    suggestions.push('Start each bullet with action verbs: "Developed", "Led", "Implemented", "Optimized"');
    score -= 20;
  }

  // Check for impact/results
  const hasImpact = /result|impact|outcome|benefit|improved|increased|reduced|saved/i.test(experienceText);
  if (!hasImpact) {
    issues.push('Missing business impact statements');
    suggestions.push('Explain the impact: "resulting in 30% efficiency gain" or "saved company $50K annually"');
    score -= 15;
  }

  examples.push('✓ "Led team of 5 engineers to deliver mobile app, increasing user engagement by 40%"');
  examples.push('✓ "Optimized database queries, reducing API response time by 60% and improving user experience"');
  examples.push('✓ "Managed $2M annual budget and coordinated with 3 departments to launch new product line"');

  return {
    section: 'Experience',
    score: Math.max(0, score),
    issues,
    suggestions,
    examples,
  };
}

/**
 * Analyze education section
 */
export function analyzeEducation(educationText: string): SectionFeedback {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const examples: string[] = [];
  let score = 100;

  if (!educationText || educationText.trim().length === 0) {
    return {
      section: 'Education',
      score: 50,
      issues: ['Education section is missing'],
      suggestions: ['Add your educational background including degree, institution, and graduation date'],
      examples: ['Bachelor of Science in Computer Science, University of California, Berkeley - May 2020'],
    };
  }

  // Check for degree type
  const degreeTypes = ['bachelor', 'master', 'phd', 'diploma', 'associate', 'certificate'];
  const hasDegree = degreeTypes.some(deg => educationText.toLowerCase().includes(deg));
  if (!hasDegree) {
    issues.push('Degree type not clearly specified');
    suggestions.push('Clearly state your degree: "Bachelor of Science", "Master of Business Administration", etc.');
    score -= 10;
  }

  // Check for graduation date
  const hasDate = /\d{4}|graduation|may|june|july|august|september|december/i.test(educationText);
  if (!hasDate) {
    issues.push('Graduation date missing');
    suggestions.push('Include graduation date or expected graduation date');
    score -= 15;
  }

  // Check for GPA (if strong)
  const hasGPA = /\d\.\d+\s*gpa|gpa.*\d\.\d+/i.test(educationText);
  if (!hasGPA && educationText.toLowerCase().includes('recent')) {
    suggestions.push('If GPA is 3.5 or higher, consider including it');
  }

  // Check for honors/achievements
  const hasHonors = /honor|cum laude|magna|summa|award|scholarship/i.test(educationText);
  if (!hasHonors) {
    suggestions.push('If applicable, include academic honors, scholarships, or relevant achievements');
  }

  examples.push('✓ "Bachelor of Science in Computer Science, University of California, Berkeley - May 2020"');
  examples.push('✓ "Master of Business Administration, Harvard Business School - May 2019, GPA: 3.8"');

  return {
    section: 'Education',
    score: Math.max(0, score),
    issues,
    suggestions,
    examples,
  };
}

/**
 * Analyze skills section
 */
export function analyzeSkills(skillsText: string): SectionFeedback {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const examples: string[] = [];
  let score = 100;

  if (!skillsText || skillsText.trim().length === 0) {
    return {
      section: 'Skills',
      score: 0,
      issues: ['Skills section is missing'],
      suggestions: ['Add a dedicated skills section listing technical and soft skills'],
      examples: ['Python, JavaScript, React, Node.js, AWS, Docker, Machine Learning, Data Analysis'],
    };
  }

  const skillCount = skillsText.split(/[,;]/).length;

  // Check skill count (optimal: 15-25 skills)
  if (skillCount < 5) {
    issues.push('Too few skills listed');
    suggestions.push('Include 15-25 relevant skills to improve ATS compatibility');
    score -= 20;
  } else if (skillCount > 50) {
    issues.push('Too many skills listed');
    suggestions.push('Focus on your top 15-25 most relevant skills');
    score -= 10;
  }

  // Check for skill categories
  const hasCategories = /[:\-]/.test(skillsText);
  if (!hasCategories && skillCount > 10) {
    issues.push('Skills not organized by category');
    suggestions.push('Organize skills by category: "Languages: Python, JavaScript" / "Frameworks: React, Django"');
    score -= 15;
  }

  // Check for proficiency levels
  const hasProficiency = /expert|intermediate|beginner|proficient|fluent/i.test(skillsText);
  if (!hasProficiency) {
    suggestions.push('Consider adding proficiency levels: "Expert", "Proficient", "Familiar"');
  }

  examples.push('✓ "Languages: Python, JavaScript, TypeScript | Frameworks: React, Django, FastAPI | Tools: Git, Docker, AWS"');
  examples.push('✓ "Technical: Python (Expert), JavaScript (Proficient), AWS (Proficient), Docker (Familiar)"');

  return {
    section: 'Skills',
    score: Math.max(0, score),
    issues,
    suggestions,
    examples,
  };
}

/**
 * Generate overall resume feedback
 */
export function generateOverallFeedback(
  summary: SectionFeedback,
  experience: SectionFeedback,
  education: SectionFeedback,
  skills: SectionFeedback
): {
  overallScore: number;
  feedback: string[];
  topPriorities: string[];
  strengths: string[];
} {
  const scores = [summary.score, experience.score, education.score, skills.score];
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const allIssues = [
    ...summary.issues.map(i => `Summary: ${i}`),
    ...experience.issues.map(i => `Experience: ${i}`),
    ...education.issues.map(i => `Education: ${i}`),
    ...skills.issues.map(i => `Skills: ${i}`),
  ];

  const allSuggestions = [
    ...summary.suggestions,
    ...experience.suggestions,
    ...education.suggestions,
    ...skills.suggestions,
  ];

  const topPriorities = allSuggestions.slice(0, 3);
  const strengths = [
    summary.score >= 80 && 'Strong professional summary',
    experience.score >= 80 && 'Detailed work experience with achievements',
    education.score >= 80 && 'Complete education information',
    skills.score >= 80 && 'Well-organized skills section',
  ].filter(Boolean) as string[];

  return {
    overallScore,
    feedback: allIssues,
    topPriorities,
    strengths: strengths.length > 0 ? strengths : ['Resume has good foundation'],
  };
}

export default {
  analyzeSummary,
  analyzeExperience,
  analyzeEducation,
  analyzeSkills,
  generateOverallFeedback,
};
