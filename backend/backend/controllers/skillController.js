const Profile = require("../models/Profile");

// @desc    Add skill
// @route   POST /api/profile/skills
// @access  Private
exports.addSkill = async (req, res) => {
  try {
    const { name, level, years, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Skill name is required"
      });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Check if skill already exists
    const existingSkill = profile.skills.find(
      skill => skill.name.toLowerCase() === name.toLowerCase()
    );

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: "Skill already exists"
      });
    }

    const newSkill = {
      name,
      level: level || "Beginner",
      years: years || 1,
      category: category || "Technical",
      isActive: true
    };

    profile.skills.push(newSkill);
    await profile.save();

    res.status(201).json({
      success: true,
      message: "Skill added successfully",
      data: profile.skills
    });
  } catch (error) {
    console.error("Add skill error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @desc    Update skill
// @route   PUT /api/profile/skills/:id
// @access  Private
exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    const skillIndex = profile.skills.findIndex(
      skill => skill._id.toString() === id
    );

    if (skillIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }

    profile.skills[skillIndex] = {
      ...profile.skills[skillIndex].toObject(),
      ...updateData
    };

    await profile.save();

    res.json({
      success: true,
      message: "Skill updated successfully",
      data: profile.skills[skillIndex]
    });
  } catch (error) {
    console.error("Update skill error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @desc    Delete skill
// @route   DELETE /api/profile/skills/:id
// @access  Private
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    const skillExists = profile.skills.some(
      skill => skill._id.toString() === id
    );

    if (!skillExists) {
      return res.status(404).json({
        success: false,
        message: "Skill not found"
      });
    }

    profile.skills = profile.skills.filter(
      skill => skill._id.toString() !== id
    );

    await profile.save();

    res.json({
      success: true,
      message: "Skill deleted successfully",
      data: profile.skills
    });
  } catch (error) {
    console.error("Delete skill error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};