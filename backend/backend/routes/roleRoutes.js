const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const roleController = require('../controllers/roleController');

// All routes are protected and require HR/Admin role
// router.use(protect);
// router.use(authorize('hr', 'admin'));

// Role CRUD
router.post('/', authMiddleware, roleController.createRole);
router.get('/', authMiddleware, roleController.getRoles);
router.get('/:id', authMiddleware, roleController.getRoleById);
router.put('/:id', authMiddleware, roleController.updateRole);
router.delete('/:id', authMiddleware, roleController.deleteRole);

module.exports = router;