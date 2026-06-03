// routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

const {
  getAllCandidates,
  getCandidateById,
  updateCandidateStatus,
  shortlistCandidate,
  rejectCandidate,
  addCandidateNote,
  scheduleInterview,
  downloadResume,
  exportCandidates
} = require('../controllers/candidatesList');

// All routes are protected and restricted to HR and Admin
router.use(authMiddleware);
router.use(authorize('admin', 'hr'));

// Candidate management routes
router.get('/', getAllCandidates);
router.get('/export', exportCandidates);
router.get('/:id', getCandidateById);
router.get('/:id/resume', downloadResume);

router.patch('/:id/status', updateCandidateStatus);

router.post('/:id/shortlist', shortlistCandidate);
router.post('/:id/reject', rejectCandidate);
router.post('/:id/notes', addCandidateNote);
router.post('/:id/interviews', scheduleInterview);

module.exports = router;