/**
 * services/aiAnalysisService.js
 * 
 * Gemini 1.5 Flash AI analysis service (free tier).
 * Set GEMINI_API_KEY in your .env file.
 * Free tier: 1500 requests/day, 15 req/min
 * Get key: https://aistudio.google.com/app/apikey
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = 'gemini-1.5-flash'; // Free tier model

// ── Rate limiting helper (15 req/min on free tier) ───────────────────────────
let lastCallTime = 0;
const MIN_INTERVAL_MS = 4100; // ~14 req/min to be safe

async function rateLimitedCall(fn) {
  const now = Date.now();
  const wait = MIN_INTERVAL_MS - (now - lastCallTime);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCallTime = Date.now();
  return fn();
}

// ── Safe JSON parse from Gemini response ─────────────────────────────────────
function safeParseJSON(text) {
  try {
    // Strip markdown code fences if present
    const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error('[AI] JSON parse error:', e.message, '\nRaw:', text.slice(0, 200));
    return null;
  }
}

// ── Retry wrapper ─────────────────────────────────────────────────────────────
async function withRetry(fn, retries = 3, baseDelay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const isRetryable = err.status === 429 || err.status === 503 || err.message?.includes('quota');
      if (!isRetryable || i === retries - 1) throw err;
      const delay = baseDelay * Math.pow(2, i);
      console.warn(`[AI] Retrying after ${delay}ms (attempt ${i + 1}/${retries}):`, err.message);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 1. INTRO VIDEO ANALYSIS
// ────────────────────────────────────────────────────────────────────────────
/**
 * Analyze candidate intro transcript with Gemini AI.
 * Returns structured HR insight.
 * 
 * @param {string} transcript - Speech transcript from intro video
 * @param {object} opts - Optional context: { jobTitle, communicationMetrics }
 * @returns {Promise<object>} AI analysis result
 */
async function analyzeIntroTranscript(transcript, opts = {}) {
  if (!transcript || transcript.trim().length < 10) {
    return buildDefaultIntroAnalysis('No transcript provided');
  }

  const { jobTitle = 'the role', communicationMetrics = {} } = opts;

  const prompt = `You are an expert HR analyst evaluating a job candidate's video introduction for ${jobTitle}.

Candidate's transcript:
"""
${transcript}
"""

${communicationMetrics.speakingRate ? `Speaking rate: ${communicationMetrics.speakingRate} wpm` : ''}
${communicationMetrics.fillerWords !== undefined ? `Filler words detected: ${communicationMetrics.fillerWords}` : ''}

Analyze this transcript and respond ONLY with a JSON object (no markdown, no explanation):
{
  "sentiment": "positive|neutral|negative",
  "sentimentScore": <0-100>,
  "hrInsight": "<2-3 sentence professional HR assessment>",
  "keyStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "areasToImprove": ["<area1>", "<area2>"],
  "redFlags": ["<flag if any>"],
  "technicalKeywords": ["<keyword1>", "<keyword2>"],
  "communicationRating": <0-100>,
  "professionalismRating": <0-100>,
  "recommendationNote": "<one sentence recommendation>"
}`;

  return withRetry(() =>
    rateLimitedCall(async () => {
      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = safeParseJSON(text);

      if (!parsed) return buildDefaultIntroAnalysis('Parse error');
      return {
        sentiment: parsed.sentiment || 'neutral',
        sentimentScore: parsed.sentimentScore || 50,
        hrInsight: parsed.hrInsight || '',
        keyStrengths: Array.isArray(parsed.keyStrengths) ? parsed.keyStrengths : [],
        areasToImprove: Array.isArray(parsed.areasToImprove) ? parsed.areasToImprove : [],
        redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
        technicalKeywords: Array.isArray(parsed.technicalKeywords) ? parsed.technicalKeywords : [],
        communicationRating: parsed.communicationRating || 50,
        professionalismRating: parsed.professionalismRating || 50,
        recommendationNote: parsed.recommendationNote || '',
        analyzedAt: new Date().toISOString()
      };
    })
  );
}

function buildDefaultIntroAnalysis(reason) {
  return {
    sentiment: 'neutral', sentimentScore: 50,
    hrInsight: `Analysis unavailable: ${reason}`,
    keyStrengths: [], areasToImprove: [], redFlags: [], technicalKeywords: [],
    communicationRating: 0, professionalismRating: 0, recommendationNote: '',
    analyzedAt: new Date().toISOString(), error: reason
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 2. CODING SOLUTION ANALYSIS
// ────────────────────────────────────────────────────────────────────────────
/**
 * Analyze a candidate's code submission.
 * 
 * @param {string} code - The submitted code
 * @param {string} language - Programming language
 * @param {string} problemStatement - The problem description
 * @param {object} testResults - { passed, total, error } from Piston execution
 * @returns {Promise<object>} Code analysis
 */
async function analyzeCodingSolution(code, language, problemStatement, testResults = {}) {
  if (!code || code.trim().length < 5) {
    return buildDefaultCodingAnalysis('No code provided');
  }

  const prompt = `You are a senior software engineer conducting a technical interview code review.

Problem: ${problemStatement || 'Not specified'}
Language: ${language}
Test results: ${testResults.passed !== undefined ? `${testResults.passed}/${testResults.total} tests passed` : 'Not available'}
${testResults.error ? `Runtime error: ${testResults.error}` : ''}

Candidate's code:
\`\`\`${language}
${code}
\`\`\`

Analyze this code submission. Respond ONLY with a JSON object (no markdown):
{
  "overallScore": <0-100>,
  "codeQuality": <0-100>,
  "efficiency": <0-100>,
  "correctness": <0-100>,
  "bestPractices": <0-100>,
  "readability": <0-100>,
  "feedback": "<2-3 sentence overall assessment>",
  "timeComplexity": "<O(n) notation>",
  "spaceComplexity": "<O(n) notation>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "bugs": ["<bug description if any>"],
  "codeSmells": ["<smell if any>"],
  "alternativeApproach": "<brief description of a better approach if one exists, else null>"
}`;

  return withRetry(() =>
    rateLimitedCall(async () => {
      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = safeParseJSON(text);

      if (!parsed) return buildDefaultCodingAnalysis('Parse error');
      return {
        overallScore: parsed.overallScore || 50,
        codeQuality: parsed.codeQuality || 50,
        efficiency: parsed.efficiency || 50,
        correctness: parsed.correctness || 50,
        bestPractices: parsed.bestPractices || 50,
        readability: parsed.readability || 50,
        feedback: parsed.feedback || '',
        timeComplexity: parsed.timeComplexity || 'Unknown',
        spaceComplexity: parsed.spaceComplexity || 'Unknown',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        bugs: Array.isArray(parsed.bugs) ? parsed.bugs : [],
        codeSmells: Array.isArray(parsed.codeSmells) ? parsed.codeSmells : [],
        alternativeApproach: parsed.alternativeApproach || null,
        analyzedAt: new Date().toISOString()
      };
    })
  );
}

function buildDefaultCodingAnalysis(reason) {
  return {
    overallScore: 0, codeQuality: 0, efficiency: 0, correctness: 0,
    bestPractices: 0, readability: 0, feedback: `Analysis unavailable: ${reason}`,
    timeComplexity: 'Unknown', spaceComplexity: 'Unknown',
    strengths: [], improvements: [], bugs: [], codeSmells: [], alternativeApproach: null,
    analyzedAt: new Date().toISOString(), error: reason
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 3. HR HIRE/NO-HIRE SUMMARY
// ────────────────────────────────────────────────────────────────────────────
/**
 * Generate a comprehensive HR hire/no-hire recommendation.
 * 
 * @param {object} reportData - Full interview report data
 * @returns {Promise<object>} HR summary with recommendation
 */
async function generateHRSummary(reportData) {
  const {
    scores = {}, intro = {}, mcq = {}, coding = {},
    proctoring = {}, interview = {}, durationMinutes = 0
  } = reportData;

  const prompt = `You are a senior HR director making a hiring decision based on an interview report.

Position: ${interview.title || 'Not specified'}

SCORES:
- Overall: ${scores.overall || 0}/100
- Intro/Presentation: ${scores.intro || 0}/100
- Communication: ${scores.communication || 0}/100
- MCQ Knowledge: ${scores.mcq || 0}/100
- Coding: ${scores.coding || 0}/100
- Integrity: ${scores.integrity || 0}/100

MCQ: ${mcq.correct || 0}/${mcq.total || 0} correct

CODING: ${coding.score || 0}/100
${coding.challenges?.map(c => `- ${c.title}: ${c.testResults?.passed || 0}/${c.testResults?.total || 0} tests passed`).join('\n') || ''}

INTEGRITY FLAGS:
- Tab switches: ${proctoring.tabSwitches || 0}
- Copy/paste events: ${proctoring.copyPasteEvents || 0}
- Integrity score: ${proctoring.integrityScore || 100}%

AI INTRO INSIGHT:
${intro.aiAnalysis?.hrInsight || 'Not available'}
Key strengths: ${intro.aiAnalysis?.keyStrengths?.join(', ') || 'None noted'}
Red flags: ${intro.aiAnalysis?.redFlags?.join(', ') || 'None'}

Duration: ${durationMinutes} minutes

Provide a hiring decision. Respond ONLY with JSON (no markdown):
{
  "recommendation": "strong_hire|hire|maybe|no_hire|strong_no_hire",
  "verdict": "<2-3 word verdict label>",
  "confidence": <60-98>,
  "summary": "<3-4 sentence professional hiring summary>",
  "strengths": ["<top strength 1>", "<top strength 2>", "<top strength 3>"],
  "concerns": ["<concern 1 if any>", "<concern 2 if any>"],
  "suggestedNextSteps": ["<next step 1>", "<next step 2>"],
  "salaryBandNote": "<optional note on expected compensation range based on performance>",
  "fitScore": <0-100>
}`;

  return withRetry(() =>
    rateLimitedCall(async () => {
      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = safeParseJSON(text);

      if (!parsed) return { recommendation: 'maybe', verdict: 'Review Required', confidence: 50, error: 'Parse error' };

      return {
        recommendation: parsed.recommendation || 'maybe',
        verdict: parsed.verdict || 'Review Required',
        confidence: parsed.confidence || 50,
        summary: parsed.summary || '',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
        suggestedNextSteps: Array.isArray(parsed.suggestedNextSteps) ? parsed.suggestedNextSteps : [],
        salaryBandNote: parsed.salaryBandNote || null,
        fitScore: parsed.fitScore || 50,
        generatedAt: new Date().toISOString()
      };
    })
  );
}

// ────────────────────────────────────────────────────────────────────────────
// 4. MCQ QUESTION GENERATION (bonus helper)
// ────────────────────────────────────────────────────────────────────────────
/**
 * Generate MCQ questions for a given topic using Gemini.
 * 
 * @param {string} topic - Topic/skill area (e.g. "React", "Data Structures")
 * @param {number} count - Number of questions (max 10)
 * @param {string} difficulty - "easy"|"medium"|"hard"
 * @returns {Promise<Array>} Array of question objects
 */
async function generateMCQQuestions(topic, count = 5, difficulty = 'medium') {
  const prompt = `Generate ${Math.min(count, 10)} ${difficulty} multiple-choice questions about ${topic} for a technical interview.

Respond ONLY with a JSON array (no markdown):
[
  {
    "question": "<question text>",
    "options": ["<A>", "<B>", "<C>", "<D>"],
    "correctAnswer": <0-3 index>,
    "explanation": "<brief explanation of correct answer>",
    "difficulty": "${difficulty}",
    "topic": "${topic}"
  }
]`;

  return withRetry(() =>
    rateLimitedCall(async () => {
      const model = genAI.getGenerativeModel({ model: MODEL });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = safeParseJSON(text);
      return Array.isArray(parsed) ? parsed : [];
    })
  );
}

module.exports = {
  analyzeIntroTranscript,
  analyzeCodingSolution,
  generateHRSummary,
  generateMCQQuestions,
};