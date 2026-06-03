const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

router.get("/live/:roleId", async (req, res) => {
  try {

    const roleId = req.params.roleId;

    const questions = await Question.find({
      roles: roleId,
      isActive: true
    });

    res.json(questions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;