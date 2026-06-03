const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');
const {
  scheduleInterview,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  updateInterviewStatus,
  cancelInterview,
  resendInvitations,
  deleteInterview,
  getInterviewStats,
  getUpcomingInterviews,
  getPastInterviews,
  cloneInterview
} = require('../controllers/scheduleInterviewController');

// All routes are protected and restricted to HR and Admin
router.use(authMiddleware);
router.use(authorize('admin', 'hr'));

// Static routes first
router.get('/stats/dashboard', getInterviewStats);
router.get('/upcoming', getUpcomingInterviews);
router.get('/past', getPastInterviews);

// CRUD operations
router.post('/schedule', scheduleInterview);
router.get('/', getAllInterviews);
router.get('/:id', getInterviewById);
router.put('/:id', updateInterview);
router.patch('/:id/status', updateInterviewStatus);
router.post('/:id/cancel', cancelInterview);
router.post('/:id/resend', resendInvitations);
router.post('/:id/clone', cloneInterview);
router.delete('/:id', deleteInterview);

module.exports = router;