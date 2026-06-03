// routes/candidateInterviewRoutes.js
// Complete routes file — candidate + HR report endpoints

const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const router = express.Router();

const ctrl       = require('../controllers/CandidateInterviewController');
const codingExec = require('../services/codingExecutionService');
const aiService  = require('../services/aiAnalysisService');

// ── Auth middlewares ──────────────────────────────────────────────────────────
// Replace these with your actual auth middleware imports
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

// All question routes require authentication AND admin/hr role
router.use(authMiddleware);
router.use(authorize('admin', 'hr', 'candidate'));

// =============================================================================
// MULTER — Intro Video Upload
// =============================================================================
const introStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/intros');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Format: <interviewId>_<userId>_<timestamp>.webm
    const ext    = path.extname(file.originalname) || '.webm';
    const unique = `${req.params.id}_${req.user._id || req.user.id}_${Date.now()}${ext}`;
    cb(null, unique);
  },
});

const uploadIntro = multer({
  storage: introStorage,
  limits:  { fileSize: 250 * 1024 * 1024 }, // 250 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  },
});

// =============================================================================
// CANDIDATE ROUTES
// =============================================================================

// List all interviews for logged-in candidate
router.get('/interviews', ctrl.getCandidateInterviews);   // GET  /api/candidate/interviews
router.get( '/my-interviews', ctrl.getCandidateInterviews); 

// Get single interview details (questions, rounds, etc.)
router.get('/interviews/:id', ctrl.getCandidateInterviewById);

// Start interview session
router.post('/interviews/:id/start', ctrl.startInterview);

// Save intro video — multipart (video file) OR JSON (AI scores update)
// uploadIntro.single('video') is safe for JSON requests too (req.file = undefined)
router.post('/interviews/:id/intro', uploadIntro.single('video'), ctrl.saveIntroVideo);

// Gemini AI analysis for intro transcript
router.post('/interviews/:id/analyze-intro', aiService.analyzeIntroTranscript);

// Save MCQ answers
router.post('/interviews/:id/mcq',  ctrl.saveMCQAnswers);

// Save coding progress / final submission
router.post('/interviews/:id/coding', ctrl.saveCodingProgress);

// Save Gemini AI analysis for a coding challenge
// router.post('/interviews/:id/coding-analysis', ctrl.saveCodingAnalysis);

// Run code via Piston API
router.post('/interviews/:id/run-code', ctrl.runCode);

// Gemini AI analysis for coding submission (called from frontend after run)
// router.post('/interviews/:id/analyze-coding', aiService.analyzeCodingSubmission);

// Save proctoring / behavioral metrics
router.post('/interviews/:id/metrics', ctrl.saveMetrics);

// Submit final interview (candidate) — returns NO scores
router.post('/interviews/:id/submit', ctrl.submitInterview);

// Candidate self-report — minimal, no scores
// router.get('/interviews/:id/report', ctrl.getInterviewReport);

// =============================================================================
// HR ROUTES — protected by hrAuth
// =============================================================================

// Full AI report for HR — all scores, transcript, code, violations
// Query: ?candidateUserId=<userId>
router.get('/interviews/:id/hr-report', ctrl.getHRReport);

// HR summary via Gemini (optional — generates hire/no-hire verdict)
// router.post('/interviews/:id/hr-summary', aiService.generateHRSummary);

// =============================================================================
// ERROR HANDLER for multer
// =============================================================================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Video file too large. Maximum 250MB allowed.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

module.exports = router;