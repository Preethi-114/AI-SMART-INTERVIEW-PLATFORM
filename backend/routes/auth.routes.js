const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const uploadMiddleware = require("../middleware/upload");

const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/my-profile", authMiddleware, authController.getProfile);
router.put("/my-profile", authMiddleware, authController.updateProfile);
router.put("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
