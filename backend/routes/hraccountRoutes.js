// routes/hrRoutes.js
const express = require('express');
const router = express.Router();
const {
  getHRAccounts,
  getHRAccount,
  createHRAccount,
  updateHRAccount,
  deleteHRAccount,
  resetPassword,
  toggleStatus,
  getHRStats,
  getHRSidebarStats
} = require('../controllers/hrController');
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');
// All routes are protected and require admin role
router.use(authMiddleware);
router.use(authorize('admin', 'hr', 'candidate'));

// Stats route - specific before /:id
router.get('/stats', getHRStats);
router.get('/sidebar/stats', getHRSidebarStats);

// CRUD routes
router.route('/')
  .get(getHRAccounts)
  .post(createHRAccount);

router.route('/:id')
  .get(getHRAccount)
  .put(updateHRAccount)
  .delete(deleteHRAccount);

router.route('/:id/reset-password').put(resetPassword),

// Additional operations
router.patch('/:id/toggle-status', toggleStatus);

module.exports = router;