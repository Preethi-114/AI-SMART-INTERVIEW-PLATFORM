// routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authorize = require('../middleware/roleAuth');
const questionController = require('../controllers/questionController');

// All question routes require authentication AND admin/hr role
router.use(authMiddleware);
router.use(authorize('admin', 'hr', 'candidate'));

// Question CRUD - Only admin and hr can access
router.post('/', questionController.createQuestion);
router.get('/', questionController.getQuestions);
router.get('/:id', questionController.getQuestionById);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);
router.get('/by-role/:roleId', questionController.getQuestionsByRole);
router.patch('/:id/toggle-status', questionController.toggleQuestionStatus);

module.exports = router;