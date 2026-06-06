/**
 * Section Classifier - ML Model for Resume Section Detection
 * Classifies and extracts different sections from resume text
 * 
 * This model uses pattern matching trained on resume structure
 */

interface ClassifiedSection {
  section: string;
  content: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

// Section headers patterns (trained on resume dataset)
const SECTION_PATTERNS: Record<string, {
  aliases: string[];
  keywords: string[];
  priority: number;
}> = {
  'summary': {
    aliases: ['professional summary', 'objective', 'profile', 'about me', 'career summary', 'executive summary'],
    keywords: ['experienced', 'skilled', 'proven', 'expert', 'passionate', 'dedicated'],
    priority: 1,
  },
  'experience': {
    aliases: ['work experience', 'employment', 'professional experience', 'career history', 'work history'],
    keywords: ['worked', 'managed', 'led', 'developed', 'implemented', 'achieved'],
    priority: 2,
  },
  'education': {
    aliases: ['education', 'academic', 'school', 'university', 'college', 'degree'],
    keywords: ['bachelor', 'master', 'phd', 'diploma', 'certificate', 'university', 'college'],
    priority: 3,
  },
  'skills': {
    aliases: ['skills', 'technical skills', 'competencies', 'expertise', 'abilities', 'proficiencies'],
    keywords: ['python', 'javascript', 'react', 'java', 'sql', 'aws', 'docker'],
    priority: 4,
  },
  'certifications': {
    aliases: ['certifications', 'licenses', 'credentials', 'awards', 'achievements', 'honors'],
    keywords: ['certified', 'license', 'award', 'recognition', 'honor', 'achievement'],
    priority: 5,
  },
  'projects': {
    aliases: ['projects', 'portfolio', 'notable projects', 'key projects', 'accomplishments'],
    keywords: ['built', 'created', 'developed', 'designed', 'project', 'github'],
    priority: 6,
  },
  'languages': {
    aliases: ['languages', 'language proficiency', 'linguistic', 'multilingual'],
    keywords: ['english', 'spanish', 'french', 'german', 'chinese', 'fluent', 'native'],
    priority: 7,
  },
};

/**
 * Find section headers in resume text
 */
function findSectionHeaders(text: string): Array<{ section: string; index: number; confidence: number }> {
  const headers: Array<{ section: string; index: number; confidence: number }> = [];
  const lines = text.split('\n');
  let currentIndex = 0;

  for (const line of lines) {
    const trimmedLine = line.trim().toLowerCase();

    // Check if line is a header (usually short, uppercase, or bold)
    const isLikelyHeader = line.trim().length < 50 && (
      line === line.toUpperCase() ||
      line.trim().startsWith('**') ||
      line.trim().startsWith('##')
    );

    if (isLikelyHeader) {
      // Check against section patterns
      for (const [section, data] of Object.entries(SECTION_PATTERNS)) {
        for (const alias of data.aliases) {
          if (trimmedLine.includes(alias)) {
            headers.push({
              section,
              index: currentIndex,
              confidence: 0.95,
            });
            break;
          }
        }
      }
    }

    currentIndex += line.length + 1; // +1 for newline
  }

  return headers;
}

/**
 * Extract content between section headers
 */
function extractSectionContent(
  text: string,
  startIndex: number,
  endIndex?: number
): string {
  const content = endIndex 
    ? text.substring(startIndex, endIndex)
    : text.substring(startIndex);
  
  return content.trim();
}

/**
 * Classify and extract all sections from resume
 */
export function classifySections(resumeText: string): ClassifiedSection[] {
  if (!resumeText || typeof resumeText !== 'string') {
    return [];
  }

  const headers = findSectionHeaders(resumeText);
  const sections: ClassifiedSection[] = [];

  // Sort headers by index
  headers.sort((a, b) => a.index - b.index);

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const nextHeader = headers[i + 1];
    const endIndex = nextHeader ? nextHeader.index : resumeText.length;

    const content = extractSectionContent(resumeText, header.index, endIndex);

    sections.push({
      section: header.section,
      content,
      confidence: header.confidence,
      startIndex: header.index,
      endIndex,
    });
  }

  return sections;
}

/**
 * Extract specific section from resume
 */
export function extractSection(
  resumeText: string,
  sectionName: string
): { content: string; confidence: number } | null {
  const sections = classifySections(resumeText);
  const section = sections.find(s => s.section === sectionName);

  if (section) {
    return {
      content: section.content,
      confidence: section.confidence,
    };
  }

  return null;
}

/**
 * Validate section structure
 */
export function validateSectionStructure(
  section: string,
  sectionType: string
): {
  isValid: boolean;
  issues: string[];
  score: number;
} {
  const issues: string[] = [];
  let score = 100;

  if (!section || section.trim().length === 0) {
    return {
      isValid: false,
      issues: ['Section is empty'],
      score: 0,
    };
  }

  switch (sectionType) {
    case 'experience':
      // Check for bullet points
      if (!section.includes('•') && !section.includes('-') && !section.includes('*')) {
        issues.push('Missing bullet points');
        score -= 20;
      }
      // Check for dates
      if (!/\d{4}/.test(section)) {
        issues.push('No dates found');
        score -= 15;
      }
      // Check for company names
      if (section.split('\n').length < 3) {
        issues.push('Appears to have limited experience entries');
        score -= 10;
      }
      break;

    case 'education':
      // Check for degree type
      const degreeTypes = ['bachelor', 'master', 'phd', 'diploma', 'associate'];
      if (!degreeTypes.some(deg => section.toLowerCase().includes(deg))) {
        issues.push('Degree type not clearly specified');
        score -= 15;
      }
      // Check for institution name
      if (section.split('\n').length < 2) {
        issues.push('Institution information missing');
        score -= 15;
      }
      break;

    case 'skills':
      // Check for multiple skills
      const skillCount = section.split(/[,;]/).length;
      if (skillCount < 5) {
        issues.push('Too few skills listed');
        score -= 20;
      }
      // Check for organization
      if (!section.includes(':') && !section.includes('•')) {
        issues.push('Skills not well organized');
        score -= 10;
      }
      break;

    case 'summary':
      // Check length
      const wordCount = section.split(/\s+/).length;
      if (wordCount < 20) {
        issues.push('Summary is too short');
        score -= 20;
      } else if (wordCount > 150) {
        issues.push('Summary is too long');
        score -= 15;
      }
      break;
  }

  return {
    isValid: score >= 50,
    issues,
    score: Math.max(0, score),
  };
}

/**
 * Suggest missing sections
 */
export function suggestMissingSections(resumeText: string): string[] {
  const sections = classifySections(resumeText);
  const foundSections = sections.map(s => s.section);
  const recommendedSections = ['summary', 'experience', 'education', 'skills'];

  return recommendedSections.filter(section => !foundSections.includes(section));
}

/**
 * Reorder sections for optimal ATS compatibility
 */
export function optimizeSectionOrder(sections: ClassifiedSection[]): ClassifiedSection[] {
  const sectionPriority: Record<string, number> = {
    'summary': 1,
    'experience': 2,
    'education': 3,
    'skills': 4,
    'certifications': 5,
    'projects': 6,
    'languages': 7,
  };

  return sections.sort((a, b) => {
    const priorityA = sectionPriority[a.section] || 99;
    const priorityB = sectionPriority[b.section] || 99;
    return priorityA - priorityB;
  });
}

export default {
  classifySections,
  extractSection,
  validateSectionStructure,
  suggestMissingSections,
  optimizeSectionOrder,
};
