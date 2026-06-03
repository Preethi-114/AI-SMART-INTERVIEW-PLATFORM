const Profile = require("../models/Profile");

// @desc    Add education record
// @route   POST /api/profile/education
// @access  Private
exports.addEducation = async (req, res) => {
  try {
    const { degree, field, institution, year, grade, description } = req.body;

    if (!degree || !institution || !year) {
      return res.status(400).json({
        success: false,
        message: "Degree, institution, and year are required"
      });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    const newEducation = {
      degree,
      field: field || "",
      institution,
      year,
      grade: grade || "",
      description: description || "",
      isActive: true
    };

    profile.education.push(newEducation);
    await profile.save();

    res.status(201).json({
      success: true,
      message: "Education added successfully",
      data: profile.education
    });
  } catch (error) {
    console.error("Add education error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @desc    Update education record
// @route   PUT /api/profile/education/:id
// @access  Private
exports.updateEducation = async (req, res) => {
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

    const educationIndex = profile.education.findIndex(
      edu => edu._id.toString() === id
    );

    if (educationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Education record not found"
      });
    }

    profile.education[educationIndex] = {
      ...profile.education[educationIndex].toObject(),
      ...updateData
    };

    await profile.save();

    res.json({
      success: true,
      message: "Education updated successfully",
      data: profile.education[educationIndex]
    });
  } catch (error) {
    console.error("Update education error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @desc    Delete education record
// @route   DELETE /api/profile/education/:id
// @access  Private
exports.deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    profile.education = profile.education.filter(
      edu => edu._id.toString() !== id
    );

    await profile.save();

    res.json({
      success: true,
      message: "Education deleted successfully",
      data: profile.education
    });
  } catch (error) {
    console.error("Delete education error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};