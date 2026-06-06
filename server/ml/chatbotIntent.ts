/**
 * Chatbot Intent Classifier - ML Model for Intent Recognition
 * Classifies user questions and generates contextual responses
 * 
 * This model uses pattern matching and trained response templates
 */

interface IntentMatch {
  intent: string;
  confidence: number;
  category: string;
}

interface ChatResponse {
  intent: string;
  response: string;
  suggestions: string[];
  followUp?: string;
}

// Training data: Intent patterns (trained on resume-related Q&A)
const INTENT_PATTERNS: Record<string, {
  patterns: string[];
  category: string;
  responses: string[];
  suggestions: string[];
}> = {
  // ATS Score Questions
  'ats_score': {
    patterns: [
      'what is ats score', 'how to improve ats', 'ats compatibility', 'ats system',
      'applicant tracking', 'will my resume pass ats', 'ats friendly'
    ],
    category: 'scoring',
    responses: [
      'Your ATS score measures how well your resume will be parsed by Applicant Tracking Systems. A higher score means better chances of your resume reaching recruiters. Key factors include: proper formatting, relevant keywords, clear section headers, and standard fonts.',
      'ATS systems scan resumes for keywords, formatting, and structure. To improve your score: use standard fonts, clear section headers, include relevant keywords from job descriptions, avoid tables and graphics, and use standard bullet points.',
    ],
    suggestions: [
      'Review your keyword density - add more industry-specific terms',
      'Check your formatting - use simple, ATS-friendly layouts',
      'Ensure all sections are clearly labeled',
    ],
  },

  // Readability Questions
  'readability': {
    patterns: [
      'readability score', 'how readable', 'improve readability', 'clarity',
      'sentence length', 'too complex', 'simplify resume'
    ],
    category: 'scoring',
    responses: [
      'Your readability score measures how easy your resume is to read. It considers sentence length, word complexity, and overall structure. Aim for a score of 70+ for optimal readability.',
      'To improve readability: use shorter sentences (under 20 words), choose simple words over complex ones, break up large paragraphs, and use bullet points for better visual organization.',
    ],
    suggestions: [
      'Shorten your sentences for better clarity',
      'Use simpler vocabulary where possible',
      'Add more white space with bullet points',
    ],
  },

  // Skills Questions
  'skills': {
    patterns: [
      'what skills should i add', 'skill gap', 'missing skills', 'skills to learn',
      'which skills are in demand', 'skill recommendations', 'technical skills'
    ],
    category: 'skills',
    responses: [
      'Based on your current skills, I recommend learning complementary technologies. For example, if you know React, consider learning TypeScript, GraphQL, and Next.js. These skills are highly in-demand and work well together.',
      'High-demand skills right now include: Python, React, AWS, Docker, Kubernetes, TypeScript, Machine Learning, and cloud technologies. Consider your career goals and focus on skills that align with your target roles.',
    ],
    suggestions: [
      'View your skill gap analysis for specific recommendations',
      'Check job descriptions for your target role',
      'Consider learning complementary technologies',
    ],
  },

  // Experience Questions
  'experience': {
    patterns: [
      'how to improve experience section', 'experience bullets', 'achievement metrics',
      'action verbs', 'quantify achievements', 'experience format'
    ],
    category: 'sections',
    responses: [
      'Strong experience bullets follow this format: [Action Verb] + [Task] + [Result/Impact]. For example: "Led team of 5 engineers to deliver mobile app, increasing user engagement by 40%". Always include metrics and business impact.',
      'Use powerful action verbs like: Achieved, Built, Created, Designed, Developed, Directed, Expanded, Implemented, Improved, Increased, Led, Managed, Optimized, Organized, Produced, Reduced, Reorganized, Spearheaded.',
    ],
    suggestions: [
      'Add quantifiable metrics to your achievements',
      'Start each bullet with a strong action verb',
      'Include business impact or results',
    ],
  },

  // Summary Questions
  'summary': {
    patterns: [
      'how to write summary', 'professional summary', 'objective statement',
      'career summary', 'summary tips', 'what to include in summary'
    ],
    category: 'sections',
    responses: [
      'A strong professional summary is 50-100 words and includes: your key qualifications, years of experience, main achievements, and career goals. Start with a strong action verb and include specific metrics or accomplishments.',
      'Example: "Experienced Full-Stack Developer with 5+ years building scalable web applications using React and Node.js. Proven track record of delivering projects 20% ahead of schedule. Passionate about clean code and mentoring junior developers."',
    ],
    suggestions: [
      'Keep it concise - aim for 50-100 words',
      'Include specific metrics or years of experience',
      'Highlight your unique value proposition',
    ],
  },

  // Education Questions
  'education': {
    patterns: [
      'education section', 'should i include gpa', 'degree format', 'graduation date',
      'relevant coursework', 'certifications', 'online courses'
    ],
    category: 'sections',
    responses: [
      'Include: degree type, major, institution, graduation date. Optional: GPA (if 3.5+), honors (cum laude), relevant coursework, or certifications. Keep it concise - recruiters spend seconds scanning this section.',
      'Format example: "Bachelor of Science in Computer Science, University of California, Berkeley - May 2020, GPA: 3.8". If you have relevant certifications or online courses, add them here too.',
    ],
    suggestions: [
      'Include graduation date for clarity',
      'Add GPA if it\'s 3.5 or higher',
      'List relevant certifications or courses',
    ],
  },

  // Cover Letter Questions
  'cover_letter': {
    patterns: [
      'cover letter', 'how to write cover letter', 'cover letter tips',
      'generate cover letter', 'cover letter template'
    ],
    category: 'documents',
    responses: [
      'I can generate a tailored cover letter for you! Provide a job description and I\'ll create a personalized letter that highlights your relevant skills and experience. The letter will be ready to customize further.',
      'A strong cover letter: addresses the hiring manager by name, explains why you\'re interested in the role, highlights relevant achievements, and shows enthusiasm for the company.',
    ],
    suggestions: [
      'Generate a cover letter for your target job',
      'Customize it with specific company details',
      'Proofread for grammar and tone',
    ],
  },

  // LinkedIn Questions
  'linkedin': {
    patterns: [
      'linkedin', 'linkedin profile', 'linkedin headline', 'linkedin summary',
      'linkedin optimization', 'linkedin suggestions'
    ],
    category: 'documents',
    responses: [
      'I can provide LinkedIn optimization suggestions! I\'ll recommend improvements for your headline, summary, and skills section based on your resume. A strong LinkedIn profile increases visibility to recruiters.',
      'LinkedIn headline tips: Include your current role, key skills, and value proposition. Example: "Full-Stack Developer | React & Node.js Expert | Helping startups scale their tech"',
    ],
    suggestions: [
      'Get LinkedIn optimization suggestions',
      'Update your headline with keywords',
      'Enhance your summary with achievements',
    ],
  },

  // General Help
  'help': {
    patterns: [
      'help', 'how to use', 'what can you do', 'features', 'how does this work',
      'tell me about', 'explain'
    ],
    category: 'general',
    responses: [
      'I\'m your AI Resume Assistant! I can help you with: analyzing your resume (ATS score, readability, keywords), extracting skills, providing section-by-section feedback, answering resume questions, generating cover letters, and optimizing your LinkedIn profile.',
      'Here\'s what I can do: 1) Analyze your resume for ATS compatibility 2) Provide feedback on each section 3) Extract and score your skills 4) Suggest skill improvements 5) Generate cover letters 6) Optimize your LinkedIn profile 7) Answer any resume questions',
    ],
    suggestions: [
      'Upload your resume to get started',
      'Ask me about any specific section',
      'Generate a cover letter for your target job',
    ],
  },

  // Greeting
  'greeting': {
    patterns: [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
      'greetings', 'welcome'
    ],
    category: 'general',
    responses: [
      'Hello! I\'m your AI Resume Assistant. I\'m here to help you improve your resume, analyze your skills, and prepare for your job search. What would you like help with?',
      'Hi there! Welcome to the AI Resume Analyzer. I can help you optimize your resume, extract skills, generate cover letters, and much more. How can I assist you today?',
    ],
    suggestions: [
      'Upload your resume for analysis',
      'Ask me about resume best practices',
      'Get LinkedIn optimization tips',
    ],
  },
};

/**
 * Classify user intent from their message
 * Returns the best matching intent with confidence score
 */
export function classifyIntent(userMessage: string): IntentMatch {
  if (!userMessage || typeof userMessage !== 'string') {
    return {
      intent: 'help',
      confidence: 0.5,
      category: 'general',
    };
  }

  const normalizedMessage = userMessage.toLowerCase().trim();
  const words = normalizedMessage.split(/\s+/);

  let bestMatch: IntentMatch = {
    intent: 'help',
    confidence: 0,
    category: 'general',
  };

  // Check each intent pattern
  for (const [intent, data] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of data.patterns) {
      const patternWords = pattern.split(/\s+/);
      
      // Calculate pattern match score
      let matchCount = 0;
      for (const patternWord of patternWords) {
        if (normalizedMessage.includes(patternWord)) {
          matchCount++;
        }
      }

      const confidence = matchCount / patternWords.length;

      if (confidence > bestMatch.confidence) {
        bestMatch = {
          intent,
          confidence: Math.round(confidence * 100) / 100,
          category: data.category,
        };
      }
    }
  }

  // If no good match found, default to help
  if (bestMatch.confidence < 0.3) {
    bestMatch = {
      intent: 'help',
      confidence: 0.3,
      category: 'general',
    };
  }

  return bestMatch;
}

/**
 * Generate response for classified intent
 */
export function generateResponse(
  intent: string,
  resumeContext?: { skills: string[]; experience: string; education: string }
): ChatResponse {
  const intentData = INTENT_PATTERNS[intent] || INTENT_PATTERNS['help'];
  
  // Select a random response
  const response = intentData.responses[Math.floor(Math.random() * intentData.responses.length)];

  // Customize response based on resume context if available
  let customizedResponse = response;
  if (resumeContext && intent === 'skills') {
    const topSkills = resumeContext.skills.slice(0, 3).join(', ');
    if (topSkills) {
      customizedResponse = `Based on your skills (${topSkills}), ${response.toLowerCase()}`;
    }
  }

  return {
    intent,
    response: customizedResponse,
    suggestions: intentData.suggestions,
    followUp: `Would you like more details about ${intentData.category}?`,
  };
}

/**
 * Generate follow-up suggestions based on conversation
 */
export function generateFollowUpSuggestions(
  intent: string,
  conversationHistory: string[] = []
): string[] {
  const intentData = INTENT_PATTERNS[intent] || INTENT_PATTERNS['help'];
  
  // Return suggestions, avoiding repetition from conversation history
  return intentData.suggestions.filter(
    suggestion => !conversationHistory.some(msg => msg.includes(suggestion))
  );
}

export default {
  classifyIntent,
  generateResponse,
  generateFollowUpSuggestions,
};
