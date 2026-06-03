const Profile = require("../models/Profile");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    
    let profile = await Profile.findOne({ user: req.user.id })
      .select("-__v")
      .lean();

    if (!profile) {
      // Create profile if doesn't exist
      const user = await User.findById(req.user.id).select("firstName lastName email");
      
      profile = await Profile.create({
        user: req.user.id,
        personal: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email
        },
        professional: {
          status: 'Active',
          memberSince: new Date()
        }
      });

      profile = profile.toObject();
    }

    // Add virtual fullName
    profile.fullName = `${profile.personal.firstName || ''} ${profile.personal.lastName || ''}`.trim();
    
    if (profile.personal.profilePhoto) {
      if (profile.personal.profilePhoto.startsWith('/')) {
        // If it's a local path, convert to full URL
        profile.personal.profilePhoto = `${req.protocol}://${req.get('host')}${profile.personal.profilePhoto}`;
      }
    } else {
      // Generate default avatar URL
      profile.personal.profilePhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=667eea&color=fff&size=256`;
    }
    
    // Generate full URL for resume if exists
    if (profile.resume && profile.resume.publicUrl) {
      if (profile.resume.publicUrl.startsWith('/')) {
        // If it's a local path, convert to full URL
        profile.resume.fullUrl = `${req.protocol}://${req.get('host')}${profile.resume.publicUrl}`;
      }
      
      // Also ensure we're returning the resume object
      if (!profile.resume) {
        profile.resume = {};
      }
    }

    profile.profileCompletion = calculateProfileCompletion(profile);
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(200).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      personal,
      professional,
      education,
      skills,
      socialLinks
    } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      // Create profile if doesn't exist
      const user = await User.findById(req.user.id).select("firstName lastName email");
      
      profile = await Profile.create({
        user: req.user.id,
        personal: {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email
        },
        professional: {
          status: 'Active',
          memberSince: new Date()
        }
      });
    }

    // Update fields
    if (personal) {
      profile.personal = {
        ...profile.personal.toObject(),
        ...personal
      };
    }
    
    if (professional) {
      profile.professional = {
        ...profile.professional.toObject(),
        ...professional
      };
    }
    
    if (education && Array.isArray(education)) {
      profile.education = education.map(edu => ({
        ...edu,
        isActive: true
      }));
    }
    
    if (skills && Array.isArray(skills)) {
      profile.skills = skills.map(skill => ({
        ...skill,
        isActive: true
      }));
    }
    
    if (socialLinks) {
      profile.socialLinks = socialLinks;
    }

    await profile.save();

    // Get updated profile
    const updatedProfile = await Profile.findOne({ user: req.user.id })
      .select("-__v")
      .lean();
    
    // Add virtual fullName
    updatedProfile.fullName = `${updatedProfile.personal.firstName || ''} ${updatedProfile.personal.lastName || ''}`.trim();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @desc    Upload profile photo
// @route   POST /api/profile/upload-photo
// @access  Private
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file"
      });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Delete old profile photo if exists
    if (profile.personal.profilePhoto && profile.personal.profilePhoto.startsWith("/uploads/")) {
      const oldPhotoPath = path.join(__dirname, "..", profile.personal.profilePhoto);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update profile photo URL
    const photoUrl = `/uploads/${req.file.filename}`;
    profile.personal.profilePhoto = photoUrl;
    
    await profile.save();

    res.json({
      success: true,
      message: "Profile photo uploaded successfully",
      data: {
        url: photoUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error("Upload photo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @desc    Upload resume
// @route   POST /api/profile/upload-resume
// @access  Private
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file"
      });
    }

    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Delete old resume if exists
    if (profile.resume && profile.resume.storagePath) {
      const oldResumePath = path.join(__dirname, "..", profile.resume.storagePath);
      if (fs.existsSync(oldResumePath)) {
        fs.unlinkSync(oldResumePath);
      }
    }

    // Update resume info
    const fileUrl = `/uploads/${req.file.filename}`;
    profile.resume = {
      fileName: req.file.originalname,
      fileSize: formatFileSize(req.file.size),
      fileType: req.file.mimetype,
      storagePath: req.file.path,
      publicUrl: fileUrl,
      uploadedAt: new Date(),
      lastUpdated: new Date()
    };

    await profile.save();

    res.json({
      success: true,
      message: "Resume uploaded successfully",
      data: profile.resume
    });
  } catch (error) {
    console.error("Upload resume error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @desc    Get profile statistics
// @route   GET /api/profile/stats
// @access  Private
exports.getProfileStats = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .select("profileCompletion education skills resume metadata professional")
      .lean();
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    const stats = {
      profileCompletion: profile.profileCompletion || 0,
      educationCount: profile.education ? profile.education.length : 0,
      skillCount: profile.skills ? profile.skills.length : 0,
      hasResume: !!(profile.resume && profile.resume.fileName),
      interviewCount: profile.metadata ? profile.metadata.interviewCount || 0 : 0,
      averageScore: profile.metadata ? profile.metadata.averageScore || 0 : 0,
      profileViews: profile.metadata ? profile.metadata.profileViews || 0 : 0,
      memberSince: profile.professional ? profile.professional.memberSince : new Date(),
      candidateId: profile.professional ? profile.professional.candidateId : "",
      status: profile.professional ? profile.professional.status : "Active"
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Simplified profile completion calculation
const calculateProfileCompletion = (profile) => {
  const requiredFields = [
    // Personal Info
    { path: 'personal.firstName', weight: 10 },
    { path: 'personal.lastName', weight: 10 },
    { path: 'personal.email', weight: 10 },
    { path: 'personal.phone', weight: 8 },
    { path: 'personal.profilePhoto', weight: 5, check: (value) => 
      !value || !value.includes('ui-avatars.com') // Not default avatar
    },
    
    // Professional Info
    { path: 'professional.title', weight: 12 },
    { path: 'professional.experience', weight: 10 },
    
    // Education (at least one)
    { path: 'education', weight: 15, check: (value) => 
      Array.isArray(value) && value.length > 0
    },
    
    // Skills (at least one)
    { path: 'skills', weight: 10, check: (value) => 
      Array.isArray(value) && value.length > 0
    },
    
    // Resume
    { path: 'resume.fileName', weight: 10 }
  ];

  let completionScore = 0;
  
  requiredFields.forEach(field => {
    const value = getNestedValue(profile, field.path);
    
    if (field.check) {
      if (field.check(value)) {
        completionScore += field.weight;
      }
    } else if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' && value.trim() !== '') {
        completionScore += field.weight;
      } else if (typeof value !== 'string') {
        completionScore += field.weight;
      }
    }
  });

  return Math.min(completionScore, 100);
};

// Helper to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, obj);
};