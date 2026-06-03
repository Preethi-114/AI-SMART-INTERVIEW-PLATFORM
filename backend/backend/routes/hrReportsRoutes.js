// backend/routes/hrReportsRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');

const {
  getAllInterviewResponses,
  getInterviewReport,
  updateCandidateSelection,
  bulkUpdateSelection,
  getReportStats
} = require('../controllers/hrReportsController');

// All routes require authentication and HR/Admin role
router.use(authMiddleware);
router.use(authorize('admin', 'hr'));

// Routes
router.get('/interviews/responses', getAllInterviewResponses);
router.get('/interviews/stats', getReportStats);  // Add this line
router.get('/interviews/:interviewId/candidate/:candidateId/report', getInterviewReport);
router.post('/interviews/candidate/:id/select', updateCandidateSelection);
router.post('/interviews/bulk-action', bulkUpdateSelection);

module.exports = router;