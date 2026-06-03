// backend/models/InterviewResponse.js
// Complete updated model with all new fields

const mongoose = require('mongoose');

const interviewResponseSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  startedAt: Date,
  completedAt: Date,
  
  // ==================== INTRO VIDEO WITH AI ANALYSIS ====================
  introVideo: {
    url: String,
    storagePath: String,
    fileName: String,
    fileSize: Number,
    duration: Number,
    transcript: String,
    uploadedAt: Date,
    
    aiAnalysis: {
      overallScore: Number,
      sentiment: String,
      sentimentScore: Number,
      communicationScore: Number,
      clarityScore: Number,
      confidenceScore: Number,
      professionalismScore: Number,
      relevanceScore: Number,
      speakingRate: Number,
      wordCount: Number,
      fillerWordCount: Number,
      technicalKeywords: [String],
      keyStrengths: [String],
      areasToImprove: [String],
      redFlags: [String],
      hrInsight: String,
      recommendation: String,
      confidence: Number,
      speakingPaceAssessment: String,
      grammarIssues: [String],
      analyzer: String,
      analyzedAt: Date
    }
  },
  
  // ==================== MCQ ANSWERS ====================
  mcqAnswers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    questionText: String,
    selectedOption: String,
    selectedOptionText: String,
    correctAnswer: String,
    isCorrect: Boolean,
    pointsEarned: Number,
    timeSpent: Number,
    answeredAt: Date
  }],
  
  mcqStats: {
    totalQuestions: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    percentageScore: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }
  },
  
  // ==================== CODING SOLUTIONS ====================
  codingResponses: [{
    challengeId: mongoose.Schema.Types.ObjectId,
    challengeTitle: String,
    code: String,
    language: String,
    executionResult: {
      success: { type: Boolean, default: false },
      output: String,
      error: String,
      executionTime: { type: Number, default: 0 },
      matchesExpected: { type: Boolean, default: false }
    },
    score: { type: Number, default: 0 },
    aiAnalysis: {
      overallScore: Number,
      codeQuality: Number,
      readability: Number,
      efficiency: Number,
      correctness: Number,
      bestPractices: Number,
      complexity: Number,
      feedback: String,
      timeComplexity: String,
      spaceComplexity: String,
      strengths: [String],
      improvements: [String],
      bugs: [String],
      codeSmells: [String],
      alternativeApproach: String,
      metrics: {
        lineCount: Number,
        hasComments: Boolean,
        hasFunctions: Boolean,
        actualOutput: String,
        expectedOutput: String,
        matchesExpected: Boolean
      },
      analyzedAt: Date
    },
    timeSpent: { type: Number, default: 0 },
    submittedAt: Date
  }],
  
  // ==================== CODING STATS ====================
  codingStats: {
    challengesCompleted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }
  },
  
  // ==================== PROCTORING DATA ====================
  proctoring: {
    integrityScore: { type: Number, default: 100 },
    tabSwitches: { type: Number, default: 0 },
    copyPasteEvents: { type: Number, default: 0 },
    screenResizes: { type: Number, default: 0 },
    violations: [{
      type: String,
      timestamp: Date,
      details: String
    }]
  },
  
  // ==================== PERFORMANCE STATS ====================
  performanceStats: {
    introScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    mcqScore: { type: Number, default: 0 },
    codingScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    codingAIScore: { type: Number, default: 0 },
    codingFeedback: { type: String, default: '' },
    roundsCompleted: {
      intro: { type: Boolean, default: false },
      mcq: { type: Boolean, default: false },
      coding: { type: Boolean, default: false }
    },
    totalTimeSpent: { type: Number, default: 0 }
  },
  
  // ==================== TIMELINE ====================
  timeline: [{
    event: String,
    timestamp: Date,
    detail: String
  }]
  
}, { timestamps: true });

// Calculate overall score
interviewResponseSchema.methods.calculateOverallScore = function() {
  const stats = this.performanceStats;
  const overall = Math.round(
    (stats.introScore || 0) * 0.20 +
    (stats.communicationScore || 0) * 0.15 +
    (stats.mcqScore || 0) * 0.30 +
    (stats.codingScore || 0) * 0.35
  );
  stats.overallScore = overall;
  return overall;
};

// Calculate integrity score
interviewResponseSchema.methods.calculateIntegrityScore = function() {
  const proctoring = this.proctoring;
  let score = 100;
  score -= (proctoring.tabSwitches || 0) * 5;
  score -= (proctoring.copyPasteEvents || 0) * 3;
  score -= (proctoring.screenResizes || 0) * 2;
  proctoring.integrityScore = Math.max(0, Math.min(100, score));
  return proctoring.integrityScore;
};

module.exports = mongoose.model('InterviewResponse', interviewResponseSchema);