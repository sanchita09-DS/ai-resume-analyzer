/**
 * Resume Scoring Engine
 * Calculates ATS compatibility, readability, and keyword density scores
 */

interface ScoringResult {
  atsScore: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
}

/**
 * Calculate ATS (Applicant Tracking System) compatibility score
 * Checks for proper formatting, standard sections, and keyword presence
 */
export function calculateATSScore(resumeText: string): number {
  let score = 0;
  const maxScore = 100;
  const textLower = resumeText.toLowerCase();

  // Check for standard resume sections (20 points)
  const sections = ["experience", "education", "skills", "summary", "contact"];
  let sectionCount = 0;
  for (const section of sections) {
    if (textLower.includes(section)) {
      sectionCount++;
    }
  }
  score += (sectionCount / sections.length) * 20;

  // Check for contact information (15 points)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+?1?\s?)?(\([0-9]{3}\)|[0-9]{3})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/;

  if (emailRegex.test(resumeText)) score += 8;
  if (phoneRegex.test(resumeText)) score += 7;

  // Check for dates (10 points)
  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{1,2}-\d{1,2}|January|February|March|April|May|June|July|August|September|October|November|December)/i;
  const dateMatches = resumeText.match(dateRegex);
  if (dateMatches && dateMatches.length > 0) {
    score += Math.min(10, dateMatches.length);
  }

  // Check for action verbs (15 points)
  const actionVerbs = [
    "achieved",
    "managed",
    "developed",
    "implemented",
    "designed",
    "led",
    "created",
    "built",
    "improved",
    "increased",
    "reduced",
    "optimized",
    "coordinated",
    "directed",
    "executed",
  ];
  let verbCount = 0;
  for (const verb of actionVerbs) {
    if (textLower.includes(verb)) {
      verbCount++;
    }
  }
  score += Math.min(15, verbCount * 2);

  // Check for quantifiable achievements (15 points)
  const numberRegex = /\d+%|\$\d+|increased by \d+|reduced by \d+/gi;
  const numberMatches = resumeText.match(numberRegex);
  if (numberMatches) {
    score += Math.min(15, numberMatches.length * 3);
  }

  // Check for proper formatting (keywords without special characters) (10 points)
  const properlyFormatted = resumeText.split("\n").length > 3;
  if (properlyFormatted) {
    score += 10;
  }

  // Check for bullet points or structured format (10 points)
  const bulletPoints = (resumeText.match(/[\n•\-\*]/g) || []).length;
  if (bulletPoints > 5) {
    score += 10;
  }

  return Math.min(maxScore, Math.round(score));
}

/**
 * Calculate readability score based on text complexity
 * Uses Flesch-Kincaid readability formula
 */
export function calculateReadabilityScore(resumeText: string): number {
  const sentences = resumeText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = resumeText.split(/\s+/).filter((w) => w.length > 0);
  const syllables = countSyllables(resumeText);

  if (sentences.length === 0 || words.length === 0) {
    return 0;
  }

  // Flesch-Kincaid Grade Level formula
  const gradeLevel =
    0.39 * (words.length / sentences.length) +
    11.8 * (syllables / words.length) -
    15.59;

  // Convert grade level to 0-100 score
  // Grade 0-6 = Excellent (90-100)
  // Grade 6-8 = Good (80-90)
  // Grade 8-10 = Average (70-80)
  // Grade 10-12 = Fair (60-70)
  // Grade 12+ = Poor (0-60)

  let score = 100;
  if (gradeLevel > 12) {
    score = Math.max(0, 60 - (gradeLevel - 12) * 5);
  } else if (gradeLevel > 10) {
    score = 60 + (12 - gradeLevel) * 5;
  } else if (gradeLevel > 8) {
    score = 70 + (10 - gradeLevel) * 5;
  } else if (gradeLevel > 6) {
    score = 80 + (8 - gradeLevel) * 5;
  } else {
    score = 90 + Math.min(10, (6 - gradeLevel) * 5);
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Count syllables in text (rough estimation)
 */
function countSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let totalSyllables = 0;

  for (const word of words) {
    totalSyllables += estimateSyllables(word);
  }

  return totalSyllables;
}

/**
 * Estimate syllables in a word
 */
function estimateSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;

  let syllableCount = 0;
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = "aeiouy".includes(word[i]);
    if (isVowel && !previousWasVowel) {
      syllableCount++;
    }
    previousWasVowel = isVowel;
  }

  // Adjust for silent e
  if (word.endsWith("e")) {
    syllableCount--;
  }

  // Adjust for ed ending
  if (word.endsWith("ed") && word.length > 3) {
    if (!"aeiou".includes(word[word.length - 3])) {
      syllableCount++;
    }
  }

  return Math.max(1, syllableCount);
}

/**
 * Calculate keyword density in resume
 */
export function calculateKeywordDensity(resumeText: string): Record<string, number> {
  const words = resumeText
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3); // Only words longer than 3 characters

  const totalWords = words.length;
  const wordFrequency: Record<string, number> = {};

  // Count word frequencies
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z0-9]/g, "");
    if (cleanWord.length > 0 && !isCommonWord(cleanWord)) {
      wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
    }
  }

  // Convert to density percentages and sort by frequency
  const density: Record<string, number> = {};
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20); // Top 20 keywords

  for (const [word, count] of sortedWords) {
    density[word] = Math.round((count / totalWords) * 10000) / 100; // Percentage with 2 decimals
  }

  return density;
}

/**
 * Check if word is a common English word (stopword)
 */
function isCommonWord(word: string): boolean {
  const commonWords = new Set([
    "the",
    "and",
    "for",
    "are",
    "but",
    "not",
    "you",
    "all",
    "can",
    "her",
    "was",
    "one",
    "our",
    "out",
    "day",
    "get",
    "has",
    "him",
    "his",
    "how",
    "its",
    "may",
    "new",
    "now",
    "old",
    "see",
    "two",
    "way",
    "who",
    "boy",
    "did",
    "its",
    "let",
    "put",
    "say",
    "she",
    "too",
    "use",
    "that",
    "this",
    "with",
    "have",
    "from",
    "they",
    "been",
    "have",
    "were",
    "said",
    "each",
    "which",
    "their",
    "what",
    "about",
    "would",
    "could",
    "should",
    "also",
    "more",
    "most",
    "some",
    "such",
    "only",
    "just",
    "very",
    "when",
    "where",
    "while",
    "during",
    "before",
    "after",
  ]);

  return commonWords.has(word);
}

/**
 * Generate comprehensive scoring result
 */
export function scoreResume(resumeText: string): ScoringResult {
  return {
    atsScore: calculateATSScore(resumeText),
    readabilityScore: calculateReadabilityScore(resumeText),
    keywordDensity: calculateKeywordDensity(resumeText),
  };
}
