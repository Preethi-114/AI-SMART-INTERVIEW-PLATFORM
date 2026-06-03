// backend/controllers/candidateInterviewController.js
// Updated with coding stats - all existing functions remain unchanged

const path = require('path');
const fs   = require('fs');

const Interview         = require('../models/Interview');
const InterviewResponse = require('../models/InterviewResponse');
const Question          = require('../models/Question');
const Profile           = require('../models/Profile');
const Role              = require('../models/Role');
const codingExec = require('../services/codingExecutionService');
const IntroVideoAnalysisService = require('../services/introVideoAnalysisService');
const { executeCode } = require('../services/codingExecutionService');
const CodeAIAnalysisService = require('../services/codeAIAnalysisService');

// =============================================================================
// AI ANALYSIS HELPERS
// =============================================================================

/**
 * Rule-based communication analysis from transcript
 * Always runs server-side — no external API needed
 */
const analyzeCommunicationSkills = (transcript, duration) => {
  if (!transcript || transcript.trim().length === 0) {
    return {
      overallScore: 0, fluency: 0, clarity: 0, confidence: 0,
      grammar: 0, vocabulary: 0, relevance: 0,
      wordCount: 0, speakingRate: 0,
      fillerWords: [], strengths: [], improvements: [],
      detailedAnalysis: {},
    };
  }

  const words     = transcript.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const speakingRate = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;

  // Filler word detection
  const fillerList = ['um', 'uh', 'ah', 'like', 'you know', 'actually',
    'basically', 'sort of', 'kind of', 'well', 'so', 'right', 'okay'];
  const fillerWords = [];
  fillerList.forEach(f => {
    const matches = transcript.match(new RegExp(`\\b${f}\\b`, 'gi'));
    if (matches) fillerWords.push({ word: f, count: matches.length });
  });
  const totalFillers = fillerWords.reduce((s, f) => s + f.count, 0);

  // Grammar signals
  const hasSubjectVerbErrors = /\b(he don't|she don't|they doesn't|we was|I is)\b/i.test(transcript);
  const sentenceCount = (transcript.match(/[.!?]+/g) || []).length || 1;

  // Vocabulary richness
  const uniqueWords    = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))).size;
  const vocabularyScore = Math.min(100, Math.round((uniqueWords / Math.max(wordCount, 1)) * 150));

  // Relevance — interview keywords
  const relevantKeywords = ['experience', 'skill', 'project', 'team', 'work', 'learn',
    'develop', 'problem', 'solve', 'achieve', 'result', 'passion', 'interest',
    'career', 'goal', 'company', 'role', 'position', 'contribute', 'background'];
  let relevanceHits = 0;
  relevantKeywords.forEach(k => { if (transcript.toLowerCase().includes(k)) relevanceHits++; });
  const relevanceScore = Math.min(100, Math.round(relevanceHits * 5));

  // Individual scores
  const fluencyScore    = Math.min(100, Math.max(0, 100 - totalFillers * 3));
  const clarityScore    = wordCount > 0
    ? Math.min(100, Math.round((sentenceCount / wordCount) * 1000))
    : 50;
  const confidenceScore = speakingRate >= 100 && speakingRate <= 160 ? 85
    : speakingRate > 160 ? 70 : speakingRate > 0 ? 60 : 50;
  const grammarScore    = hasSubjectVerbErrors ? 55 : 85;

  const overallScore = Math.round(
    fluencyScore    * 0.25 +
    clarityScore    * 0.20 +
    confidenceScore * 0.20 +
    grammarScore    * 0.15 +
    vocabularyScore * 0.10 +
    relevanceScore  * 0.10
  );

  const strengths    = [];
  const improvements = [];

  if (fluencyScore > 80)  strengths.push('Good fluency with minimal filler words');
  else improvements.push(`Reduce filler words (${fillerWords.slice(0,3).map(f => `"${f.word}"`).join(', ')})`);

  if (vocabularyScore > 70) strengths.push('Rich and varied vocabulary');
  else improvements.push('Use more descriptive and specific language');

  if (speakingRate >= 100 && speakingRate <= 160) strengths.push('Excellent speaking pace');
  else if (speakingRate < 100 && speakingRate > 0) improvements.push('Speak slightly faster to maintain listener engagement');
  else if (speakingRate > 160) improvements.push('Slow down for better clarity and comprehension');

  if (relevanceScore > 60) strengths.push('Content relevant to interview context');
  else improvements.push('Include more specific examples about experience and skills');

  if (wordCount >= 80) strengths.push('Comprehensive and detailed response');
  else if (wordCount < 30) improvements.push('Provide more detailed and complete answers');

  return {
    overallScore, fluency: fluencyScore, clarity: clarityScore,
    confidence: confidenceScore, grammar: grammarScore,
    vocabulary: vocabularyScore, relevance: relevanceScore,
    wordCount, speakingRate, fillerWords, strengths, improvements,
    detailedAnalysis: {
      uniqueWordsCount: uniqueWords,
      avgWordLength: wordCount > 0
        ? Math.round((transcript.replace(/\s+/g, '').length / wordCount) * 10) / 10
        : 0,
      sentenceCount,
      totalFillerWords: totalFillers,
      hasGrammarErrors: hasSubjectVerbErrors,
    },
  };
};

/**
 * Simulated video engagement — replace with Azure/Google Video API in production
 */
const analyzeVideoEngagement = (duration) => ({
  eyeContact:  Math.min(100, 65 + Math.floor(Math.random() * 30)),
  engagement:  Math.min(100, 70 + Math.floor(Math.random() * 25)),
  posture:     Math.min(100, 65 + Math.floor(Math.random() * 30)),
  smiling:     Math.min(100, 55 + Math.floor(Math.random() * 40)),
  lookingAway: Math.max(0,    Math.floor(Math.random() * 15)),
  analysisNote: duration < 30
    ? 'Video too short for reliable analysis'
    : 'Engagement metrics estimated from recording',
});

// =============================================================================
// SHARED HELPERS
// =============================================================================

const resolveCandidate = async (req) => {
  const userId = req.user?._id || req.user?.id;
  if (!userId) throw Object.assign(new Error('Not authenticated'), { status: 401 });
  const profile = await Profile.findOne({ user: userId });
  if (!profile)  throw Object.assign(new Error('Candidate profile not found'), { status: 404 });
  return {
    userId,
    profile,
    email:     profile.personal?.email || req.user.email,
    profileId: profile._id,
  };
};

const matchCandidate = (interview, email, profileId) =>
  interview.selectedCandidates?.find(
    c => c.email === email ||
      (c.candidateId && c.candidateId.toString() === profileId.toString())
  );

const computeStatus = (interview, candidateData) => {
  const now = new Date();
  let dt = new Date(interview.interviewDate);
  if (interview.startTime) {
    const [h, m] = interview.startTime.split(':').map(Number);
    if (!isNaN(h)) dt.setHours(h, m || 0, 0, 0);
  }
  const end = new Date(dt.getTime() + (interview.totalDuration || 60) * 60000);
  const s   = candidateData?.status;

  if (s === 'completed')
    return { status: 'completed', canStart: false, interviewDateTime: dt, endTime: end };
  if (s === 'cancelled' || s === 'no-show' || interview.status === 'cancelled')
    return { status: 'cancelled', canStart: false, interviewDateTime: dt, endTime: end };
  if (now > end)
    return { status: 'expired',   canStart: false, interviewDateTime: dt, endTime: end };
  if (now >= dt && now <= end)
    return { status: 'available', canStart: true,  interviewDateTime: dt, endTime: end };
  return   { status: 'scheduled', canStart: false, interviewDateTime: dt, endTime: end };
};

const buildListItem = (interview, candidateData) => {
  const { status, canStart, interviewDateTime, endTime } = computeStatus(interview, candidateData);
  return {
    id:             interview._id,
    title:          interview.interviewTitle || interview.jobTitle || 'Interview',
    company:        interview.companyName    || interview.department || 'Company',
    department:     interview.department,
    date:           interviewDateTime.toISOString().split('T')[0],
    time:           interview.startTime || '00:00',
    scheduledTime:  interviewDateTime.toISOString(),
    endTime:        endTime.toISOString(),
    duration:       interview.totalDuration || 60,
    timezone:       interview.timezone || 'Asia/Kolkata',
    rounds:         interview.rounds || [],
    roundSettings:  interview.roundSettings || {},
    status,
    canStart,
    score:          candidateData?.overallScore || null,
    feedback:       candidateData?.feedback?.comments || null,
    candidateStatus: candidateData?.status || 'pending',
  };
};

/** Never send isCorrect to candidate frontend */
function formatMCQQuestions(qs, category) {
  return qs.map(q => ({
    id:          q._id,
    question:    q.title,
    description: q.description || '',
    options:     (q.options || []).map((o, i) => ({
      id:   o.id ?? o._id ?? i,
      text: o.text,
    })),
    category:    q.category || category || 'General',
    difficulty:  q.difficulty || 'Medium',
    points:      q.points     || 1,
    timeLimit:   q.timeLimit  || 90,
    optionType:  q.optionType || 'single',
  }));
}

function formatCodingQuestions(qs) {
  return qs.map(q => ({
    id:          q._id,
    title:       q.title,
    description: q.description || q.title,
    difficulty:  q.difficulty  || 'Medium',
    category:    q.category    || 'General',
    timeLimit:   q.timeLimit   || 40,
    tags:        q.tags        || [],
    starterCode: { javascript: '', python: '', java: '', cpp: '', typescript: '' },
  }));
}

async function findRole(jobTitle) {
  if (!jobTitle) return null;
  return Role.findOne({
    $or: [
      { name:  { $regex: new RegExp(jobTitle, 'i') } },
      { title: { $regex: new RegExp(jobTitle, 'i') } },
    ],
  });
}

async function fetchQuestions(type, role, count, difficulty) {
  let qs = [];

  if (role && difficulty) {
    qs = await Question.aggregate([
      { $match: { type, roles: role._id, difficulty: { $regex: new RegExp(difficulty, 'i') } } },
      { $sample: { size: count } },
    ]);
  }
  if (qs.length === 0 && role) {
    qs = await Question.aggregate([
      { $match: { type, roles: role._id } },
      { $sample: { size: count } },
    ]);
  }
  if (qs.length === 0 && difficulty) {
    qs = await Question.aggregate([
      { $match: { type, difficulty: { $regex: new RegExp(difficulty, 'i') } } },
      { $sample: { size: count } },
    ]);
  }
  if (qs.length === 0) {
    qs = await Question.aggregate([
      { $match: { type } },
      { $sample: { size: count } },
    ]);
  }
  return qs;
}

// =============================================================================
// GET /api/candidate/interviews
// =============================================================================
exports.getCandidateInterviews = async (req, res) => {
  try {
    const { email, profileId } = await resolveCandidate(req);

    const interviews = await Interview.find({
      selectedCandidates: {
        $elemMatch: { $or: [{ email }, { candidateId: profileId }] },
      },
    }).sort({ interviewDate: 1, startTime: 1 });

    const all       = interviews.map(iv => buildListItem(iv, matchCandidate(iv, email, profileId)));
    const upcoming  = all.filter(i => ['scheduled', 'available'].includes(i.status));
    const completed = all.filter(i => i.status === 'completed');
    const expired   = all.filter(i => i.status === 'expired');

    return res.json({
      success: true,
      data: {
        all, upcoming, completed, expired,
        counts: {
          all: all.length, upcoming: upcoming.length,
          completed: completed.length, expired: expired.length,
        },
      },
    });
  } catch (err) {
    console.error('[getCandidateInterviews]', err);
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};


// ==================== GET INTERVIEW BY ID ====================
exports.getCandidateInterviewById = async (req, res) => {
  try {
    const { email } = await resolveCandidate(req);
    
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    
    const role = await Role.findOne({ name: { $regex: new RegExp(interview.jobTitle, 'i') } });
    // Get MCQ questions
    const mcqQuestions = await Question.find({
      type: 'MCQ',
      roles: { $in: [role?._id] }
    }).limit(interview.roundSettings?.mcq?.questionCount || 10);
    
    // Get coding challenges
    const codingChallenges = await Question.find({
      type: 'Coding',
      roles: { $in: [role?._id] }
    }).limit(interview.roundSettings?.coding?.questionCount || 1);
    
    res.json({
      success: true,
      data: {
        id: interview._id,
        interviewTitle: interview.interviewTitle,
        jobTitle: interview.jobTitle,
        department: interview.department,
        candidateName: req.user?.firstName + ' ' + req.user?.lastName,
        candidateEmail: email,
        duration: interview.totalDuration,
        rounds: interview.rounds || ['Video Introduction', 'MCQ Round', 'Coding Round'],
        roundSettings: interview.roundSettings,
        mcqQuestions: mcqQuestions.map(q => ({
          id: q._id,
          question: q.title,
          options: q.options,
          category: q.category,
          difficulty: q.difficulty
        })),
        codingChallenges: codingChallenges.map(q => ({
          id: q._id,
          title: q.title,
          description: q.description,
          difficulty: q.difficulty
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== START INTERVIEW ====================
exports.startInterview = async (req, res) => {
  try {
    const { userId, email } = await resolveCandidate(req);
    
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    
    let response = await InterviewResponse.findOne({
      interviewId: req.params.id,
      candidateId: userId
    });
    
    if (!response) {
      response = await InterviewResponse.create({
        interviewId: req.params.id,
        candidateId: userId,
        startedAt: new Date(),
        status: 'in-progress',
        timeline: [{
          event: 'session_started',
          timestamp: new Date(),
          detail: 'Candidate started interview session'
        }]
      });
    }
    
    res.json({
      success: true,
      data: { sessionId: response._id }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== SAVE INTRO VIDEO ====================

exports.saveIntroVideo = async (req, res) => {
  try {
    const { userId } = await resolveCandidate(req);
    const { duration, transcript, aiScores } = req.body;

    // Get interview details
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    
    // Get or create interview response
    const response = await InterviewResponse.findOne({
      interviewId: req.params.id,
      candidateId: userId
    });
    
    if (!response) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (!response.introVideo) response.introVideo = {};

    // Save video file if uploaded
    if (req.file) {
      // Clean up old video if exists
      if (response.introVideo.storagePath && fs.existsSync(response.introVideo.storagePath)) {
        try { 
          fs.unlinkSync(response.introVideo.storagePath); 
        } catch(e) { 
          console.warn('Could not delete old video:', e.message);
        }
      }
      
      response.introVideo.url = `/uploads/intros/${req.file.filename}`;
      response.introVideo.storagePath = req.file.path;
      response.introVideo.fileName = req.file.originalname;
      response.introVideo.fileSize = req.file.size;
      response.introVideo.uploadedAt = new Date();
    }
    
    // Save duration and transcript
    if (duration) response.introVideo.duration = duration;
    if (transcript) response.introVideo.transcript = transcript;
    
    // Get actual duration for analysis
    const actualDuration = duration || response.introVideo.duration || 0;
    
    // Run AI Analysis on transcript
    let aiAnalysisResult = null;
    
    if (transcript && transcript.trim().length > 0) {
      console.log('[Controller] Running IntroVideoAI analysis...');
      console.log(`[Controller] Actual Duration: ${actualDuration} seconds`);
      console.log(`[Controller] Transcript: "${transcript.substring(0, 100)}..."`);
      
      try {
        aiAnalysisResult = await IntroVideoAnalysisService.analyze(
          transcript,
          actualDuration,
          interview.jobTitle || 'Software Developer',
          'Candidate'
        );
        
        console.log(`[Controller] AI Analysis Complete - Score: ${aiAnalysisResult.overallScore}%`);
        console.log(`[Controller] Speaking Rate: ${aiAnalysisResult.speakingRate} wpm`);
        console.log(`[Controller] Word Count: ${aiAnalysisResult.wordCount}`);
        
        // Save AI analysis to database
        response.introVideo.aiAnalysis = aiAnalysisResult;
        
      } catch (aiError) {
        console.error('[Controller] AI Analysis failed:', aiError);
        // Continue without AI analysis
      }
    }
    
    // Update performance stats with AI results
    if (aiAnalysisResult) {
      response.performanceStats = {
        ...response.performanceStats,
        introScore: aiAnalysisResult.overallScore || 0,
        communicationScore: aiAnalysisResult.communicationScore || 0,
        sentiment: aiAnalysisResult.sentiment || 'neutral',
        hrInsight: aiAnalysisResult.hrInsight || '',
        keyStrengths: aiAnalysisResult.keyStrengths || [],
        areasToImprove: aiAnalysisResult.areasToImprove || [],
        redFlags: aiAnalysisResult.redFlags || [],
        technicalKeywords: aiAnalysisResult.technicalKeywords || [],
        speakingPaceAssessment: aiAnalysisResult.speakingPaceAssessment || 'unknown',
        fillerWordCount: aiAnalysisResult.fillerWordCount || 0,
        wordCount: aiAnalysisResult.wordCount || 0,
        speakingRate: aiAnalysisResult.speakingRate || 0,
        roundsCompleted: {
          ...response.performanceStats?.roundsCompleted,
          intro: true
        }
      };
    } else {
      // Mark as completed even without AI analysis
      response.performanceStats = {
        ...response.performanceStats,
        roundsCompleted: {
          ...response.performanceStats?.roundsCompleted,
          intro: true
        }
      };
    }
    
    // Handle frontend AI scores if provided (backward compatibility)
    if (aiScores && !aiAnalysisResult) {
      const parsedScores = typeof aiScores === 'string' ? JSON.parse(aiScores) : aiScores;
      
      if (parsedScores) {
        response.introVideo.aiAnalysis = parsedScores;
        
        response.performanceStats = {
          ...response.performanceStats,
          introScore: parsedScores.overallScore || 0,
          communicationScore: parsedScores.communicationScore || 0,
          sentiment: parsedScores.sentiment || 'neutral',
          hrInsight: parsedScores.hrInsight || '',
          keyStrengths: parsedScores.keyStrengths || [],
          areasToImprove: parsedScores.areasToImprove || [],
          redFlags: parsedScores.redFlags || [],
          technicalKeywords: parsedScores.technicalKeywords || [],
          speakingPaceAssessment: parsedScores.speakingPaceAssessment || 'unknown',
          fillerWordCount: parsedScores.fillerWordCount || 0,
          wordCount: parsedScores.wordCount || 0,
          speakingRate: parsedScores.speakingRate || 0
        };
      }
    }
    
    // Calculate word count for timeline
    const wordCount = response.introVideo?.transcript?.split(/\s+/).filter(w => w.length > 0).length || 0;
    
    // Add timeline entry
    response.timeline.push({
      event: 'intro_completed',
      timestamp: new Date(),
      detail: `Duration: ${actualDuration}s | Score: ${response.performanceStats?.introScore || 0}% | Words: ${wordCount}`
    });
    
    await response.save();
    
    // Return success response
    res.json({
      success: true,
      message: 'Intro video saved successfully',
      data: {
        introScore: response.performanceStats?.introScore || 0,
        communicationScore: response.performanceStats?.communicationScore || 0,
        wordCount: wordCount,
        speakingRate: response.performanceStats?.speakingRate || 0,
        analysisComplete: !!aiAnalysisResult
      }
    });
    
  } catch (err) {
    console.error('[saveIntroVideo] Error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to save intro video'
    });
  }
};

// ==================== SAVE MCQ ANSWERS ====================
exports.saveMCQAnswers = async (req, res) => {
  try {
    const { userId } = await resolveCandidate(req);
    const { answers, isPartial = false } = req.body;
    
    const response = await InterviewResponse.findOne({
      interviewId: req.params.id,
      candidateId: userId
    });
    
    if (!response) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const processed = [];
    for (const ans of answers) {
      const question = await Question.findById(ans.questionId);
      if (!question) continue;
      
      const correctOption = question.options.find(o => o.isCorrect);
      const isCorrect = correctOption && correctOption.id === ans.selectedOption;
      
      processed.push({
        questionId: ans.questionId,
        questionText: question.title,
        selectedOption: ans.selectedOption,
        selectedOptionText: question.options.find(o => o.id === ans.selectedOption)?.text || '',
        correctAnswer: correctOption?.text || '',
        isCorrect,
        pointsEarned: isCorrect ? (question.points || 1) : 0,
        timeSpent: ans.timeSpent || 0,
        answeredAt: new Date()
      });
    }
    
    response.mcqAnswers = processed;
    
    if (!isPartial) {
      const correct = processed.filter(a => a.isCorrect).length;
      const percentage = processed.length > 0 ? Math.round((correct / processed.length) * 100) : 0;
      
      response.mcqStats = {
        totalQuestions: processed.length,
        correctAnswers: correct,
        percentageScore: percentage,
        timeSpent: processed.reduce((sum, a) => sum + a.timeSpent, 0)
      };
      
      response.performanceStats.mcqScore = percentage;
      response.performanceStats.roundsCompleted.mcq = true;
      
      response.timeline.push({
        event: 'mcq_completed',
        timestamp: new Date(),
        detail: `${correct}/${processed.length} correct - Score: ${percentage}%`
      });
    }
    
    await response.save();
    
    res.json({ success: true, message: 'MCQ answers saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== RUN CODE ====================
exports.runCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Code is required',
        data: { output: '', error: 'No code provided', hasError: true }
      });
    }
    
    const result = await codingExec.executeCode(code, language);
    
    res.json({
      success: true,
      data: {
        output: result.output,
        error: result.error,
        hasError: !result.success,
        executionTime: result.executionTime
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
      data: { output: '', error: err.message, hasError: true }
    });
  }
};

// ==================== SAVE CODING PROGRESS ====================
// Updated with coding stats - all existing logic preserved

exports.saveCodingProgress = async (req, res) => {
  try {
    const { userId } = await resolveCandidate(req);
    const { challengeId, code, language, isFinal = false, timeSpent = 0 } = req.body;
    
    const response = await InterviewResponse.findOne({
      interviewId: req.params.id,
      candidateId: userId
    });
    
    if (!response) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    // Initialize performanceStats if not exists
    if (!response.performanceStats) {
      response.performanceStats = {
        introScore: 0,
        communicationScore: 0,
        mcqScore: 0,
        codingScore: 0,
        overallScore: 0,
        roundsCompleted: { intro: false, mcq: false, coding: false }
      };
    }
    
    // Initialize codingStats if not exists (NEW)
    if (!response.codingStats) {
      response.codingStats = {
        challengesCompleted: 0,
        averageScore: 0,
        totalTimeSpent: 0
      };
    }
    
    // Get the question/challenge
    const challenge = await Question.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    
    // Execute code to get output
    const expectedOutput = challenge.expectedOutput || '';
    const executionResult = await executeCode(code, language, expectedOutput);
    
    // AI Analysis - compares output with expected output
    let aiAnalysis = null;
    if (code && code.trim().length > 0) {
      console.log('[Controller] Running AI code analysis...');
      aiAnalysis = await CodeAIAnalysisService.analyzeCode(
        code,
        language,
        challenge.title,
        expectedOutput,
        executionResult
      );
      console.log(`[Controller] AI Analysis - Score: ${aiAnalysis.overallScore}%`);
    }
    
    // Score comes from AI analysis (based on output match)
    const score = aiAnalysis?.overallScore || executionResult.score || 0;
    
    const entry = {
      challengeId,
      challengeTitle: challenge.title,
      code,
      language,
      executionResult: {
        success: executionResult.success || false,
        output: executionResult.output || '',
        error: executionResult.error || '',
        executionTime: executionResult.executionTime || 0,
        matchesExpected: aiAnalysis?.metrics?.matchesExpected || executionResult.matchesExpected || false
      },
      aiAnalysis,
      score,
      timeSpent, // NEW
      submittedAt: new Date()
    };
    
    const existingIndex = response.codingResponses.findIndex(
      r => r.challengeId?.toString() === String(challengeId)
    );
    
    if (existingIndex !== -1) {
      response.codingResponses[existingIndex] = entry;
    } else {
      response.codingResponses.push(entry);
    }
    
    if (isFinal) {
      // Get best score from all submissions
      const allScores = response.codingResponses
        .map(r => r.score)
        .filter(s => !isNaN(s) && s !== undefined && s !== null);
      
      const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
      
      response.performanceStats.codingScore = isNaN(bestScore) ? 0 : bestScore;
      response.performanceStats.roundsCompleted.coding = true;
      
      // Store AI analysis summary
      if (aiAnalysis) {
        response.performanceStats.codingAIScore = isNaN(aiAnalysis.overallScore) ? 0 : aiAnalysis.overallScore;
        response.performanceStats.codingFeedback = aiAnalysis.feedback || '';
      }
      
      // ==================== UPDATE CODING STATS ====================
      // 1. Challenges completed count
      const uniqueChallenges = [...new Set(response.codingResponses.map(r => r.challengeId?.toString()))];
      response.codingStats.challengesCompleted = uniqueChallenges.length;
      
      // 2. Average score across all submissions
      const allScoresForStats = response.codingResponses.map(r => r.score).filter(s => !isNaN(s));
      response.codingStats.averageScore = allScoresForStats.length > 0 
        ? Math.round(allScoresForStats.reduce((a, b) => a + b, 0) / allScoresForStats.length) 
        : 0;
      
      // 3. Total time spent
      response.codingStats.totalTimeSpent = response.codingResponses.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
      // ==================== END CODING STATS ====================
      
      response.timeline.push({
        event: 'coding_completed',
        timestamp: new Date(),
        detail: `Code submitted in ${language} - Score: ${response.performanceStats.codingScore}% | ${entry.executionResult.matchesExpected ? 'Correct Output ✓' : entry.executionResult.success ? 'Runs but wrong output' : 'Error'} | Time: ${Math.floor(response.codingStats.totalTimeSpent / 60)}m ${response.codingStats.totalTimeSpent % 60}s`
      });
    }
    
    await response.save();
    
    res.json({
      success: true,
      message: 'Coding progress saved',
      data: { 
        score: entry.score,
        output: executionResult.output || '',
        error: executionResult.error || '',
        matchesExpected: entry.executionResult.matchesExpected,
        executionTime: executionResult.executionTime || 0,
        codingStats: isFinal ? {
          challengesCompleted: response.codingStats?.challengesCompleted,
          averageScore: response.codingStats?.averageScore,
          totalTimeSpent: response.codingStats?.totalTimeSpent
        } : null,
        aiAnalysis: aiAnalysis ? {
          overallScore: aiAnalysis.overallScore,
          feedback: aiAnalysis.feedback,
          strengths: aiAnalysis.strengths,
          improvements: aiAnalysis.improvements
        } : null
      }
    });
    
  } catch (err) {
    console.error('[saveCodingProgress]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== SAVE PROCTORING METRICS ====================
exports.saveMetrics = async (req, res) => {
  try {
    const { userId } = await resolveCandidate(req);
    const { proctoring } = req.body;
    
    const response = await InterviewResponse.findOne({
      interviewId: req.params.id,
      candidateId: userId
    });
    
    if (!response) {
      return res.json({ success: true });
    }
    
    if (proctoring) {
      if (!response.proctoring) response.proctoring = {};
      
      if (proctoring.tabSwitch) {
        response.proctoring.tabSwitches = (response.proctoring.tabSwitches || 0) + 1;
        response.proctoring.violations.push({
          type: 'tab_switch',
          timestamp: new Date(),
          details: 'Tab switch detected'
        });
      }
      
      if (proctoring.copyPaste) {
        response.proctoring.copyPasteEvents = (response.proctoring.copyPasteEvents || 0) + 1;
        response.proctoring.violations.push({
          type: 'copy_paste',
          timestamp: new Date(),
          details: 'Copy/paste detected'
        });
      }
      
      if (proctoring.screenResize) {
        response.proctoring.screenResizes = (response.proctoring.screenResizes || 0) + 1;
      }
      
      response.calculateIntegrityScore();
    }
    
    await response.save();
    res.json({ success: true });
  } catch (err) {
    res.json({ success: true });
  }
};

// ==================== SUBMIT INTERVIEW ====================
exports.submitInterview = async (req, res) => {
  try {
    const { userId, email } = await resolveCandidate(req);
    
    const response = await InterviewResponse.findOne({
      interviewId: req.params.id,
      candidateId: userId
    });
    
    if (!response) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (response.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Already submitted' });
    }
    
    // Calculate final scores
    response.calculateOverallScore();
    response.calculateIntegrityScore();
    
    response.status = 'completed';
    response.completedAt = new Date();
    response.performanceStats.totalTimeSpent = 
      (response.completedAt - response.startedAt) / 1000;
    
    response.timeline.push({
      event: 'interview_submitted',
      timestamp: new Date(),
      detail: `Final Score: ${response.performanceStats.overallScore}%`
    });
    
    await response.save();
    
    // Update interview candidate status
    await Interview.findOneAndUpdate(
      { _id: req.params.id, 'selectedCandidates.email': email },
      { $set: { 'selectedCandidates.$.status': 'completed' } }
    );
    
    res.json({
      success: true,
      message: 'Interview submitted successfully',
      data: { submitted: true }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==================== GET HR REPORT ====================
exports.getHRReport = async (req, res) => {
  try {
    const { candidateUserId } = req.query;
    
    const response = await InterviewResponse.findOne({
      interviewId: req.params.id,
      candidateId: candidateUserId
    }).populate('interviewId');
    
    if (!response) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    
    res.json({
      success: true,
      data: {
        sessionId: response._id,
        candidateId: response.candidateId,
        status: response.status,
        startedAt: response.startedAt,
        completedAt: response.completedAt,
        durationMinutes: response.completedAt && response.startedAt
          ? Math.round((new Date(response.completedAt) - new Date(response.startedAt)) / 60000)
          : null,
        
        // Scores
        scores: {
          overall: response.performanceStats.overallScore,
          intro: response.performanceStats.introScore,
          communication: response.performanceStats.communicationScore,
          mcq: response.performanceStats.mcqScore,
          coding: response.performanceStats.codingScore,
          integrity: response.proctoring?.integrityScore || 100
        },
        
        // Intro Video Analysis
        intro: {
          videoUrl: response.introVideo?.url,
          duration: response.introVideo?.duration,
          transcript: response.introVideo?.transcript,
          aiAnalysis: response.introVideo?.aiAnalysis
        },
        
        // MCQ Details
        mcq: {
          score: response.mcqStats?.percentageScore || 0,
          correct: response.mcqStats?.correctAnswers || 0,
          total: response.mcqStats?.totalQuestions || 0,
          answers: response.mcqAnswers || []
        },
        
        // Coding Details - ADDED CODING STATS
        coding: {
          score: response.performanceStats.codingScore || 0,
          stats: response.codingStats || {
            challengesCompleted: 0,
            averageScore: 0,
            totalTimeSpent: 0
          },
          solutions: response.codingResponses || []
        },
        
        // Proctoring
        proctoring: {
          integrityScore: response.proctoring?.integrityScore || 100,
          tabSwitches: response.proctoring?.tabSwitches || 0,
          copyPasteEvents: response.proctoring?.copyPasteEvents || 0,
          violations: response.proctoring?.violations || []
        },
        
        // Timeline
        timeline: response.timeline || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};