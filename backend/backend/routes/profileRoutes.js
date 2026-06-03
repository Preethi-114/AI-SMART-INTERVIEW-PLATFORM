const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const uploadMiddleware = require("../middleware/upload");

// Import controllers
const profileController = require("../controllers/profileController");
const educationController = require("../controllers/educationController");
const skillController = require("../controllers/skillController");

// Profile routes
router.get("/", authMiddleware, profileController.getProfile);
router.put("/", authMiddleware, profileController.updateProfile);
router.get("/stats", authMiddleware, profileController.getProfileStats);

// Education routes
router.post("/education", authMiddleware, educationController.addEducation);
router.put("/education/:id", authMiddleware, educationController.updateEducation);
router.delete("/education/:id", authMiddleware, educationController.deleteEducation);

// Skill routes
router.post("/skills", authMiddleware, skillController.addSkill);
router.put("/skills/:id", authMiddleware, skillController.updateSkill);
router.delete("/skills/:id", authMiddleware, skillController.deleteSkill);

// File upload routes
router.post("/upload-photo", 
  authMiddleware, 
  uploadMiddleware.single("profilePhoto"), 
  profileController.uploadProfilePhoto
);

router.post("/upload-resume", 
  authMiddleware, 
  uploadMiddleware.single("resume"), 
  profileController.uploadResume
);

module.exports = router;