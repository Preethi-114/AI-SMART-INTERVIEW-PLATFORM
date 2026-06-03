// controllers/hrController.js
const User = require("../models/User");
const Profile = require("../models/Profile");
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Role = require('../models/Role');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Helper function for email validation
const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

// @desc    Get all HR accounts
// @route   GET /api/hr
// @access  Private/Admin
// @desc    Get all HR accounts with filters
// @route   GET /api/hr
// @access  Private/Admin
// @desc    Get all HR accounts with filters
// @route   GET /api/hr
// @access  Private/Admin
const getHRAccounts = async (req, res) => {
  try {
    // Get filters from query parameters
    const { status, search, sortBy } = req.query;

    // Build filter object - only HR role
    const filter = { 
      role: 'hr' // Only get HR accounts
    };
    
    // Add status filter if provided (using isActive boolean)
    if (status && status !== 'all') {
      // Convert string '1' or '0' to boolean/number
      filter.isActive = status === '1' ? 1 : 0;
    }

    // Build query
    let query = User.find(filter).select('-password');

    // Add search functionality
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = query.or([
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ]);
    }

    // Add sorting
    if (sortBy) {
      switch(sortBy) {
        case 'newest':
          query = query.sort({ createdAt: -1 });
          break;
        case 'oldest':
          query = query.sort({ createdAt: 1 });
          break;
        case 'name_asc':
          query = query.sort({ firstName: 1, lastName: 1 });
          break;
        case 'name_desc':
          query = query.sort({ firstName: -1, lastName: -1 });
          break;
        default:
          query = query.sort({ createdAt: -1 });
      }
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // Execute query
    const hrUsers = await query;

    // Enhance with profile data
    const enhancedHRs = await Promise.all(hrUsers.map(async (user) => {
      const profile = await Profile.findOne({ user: user._id }).select('professional.employeeId phone');
      
      return {
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: profile?.phone || user.phone || '',
        employeeId: profile?.professional?.employeeId || `HR${String(user._id).slice(-4)}`,
        status: user.isActive, // Convert to boolean for frontend
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    }));

    res.status(200).json({
      success: true,
      count: enhancedHRs.length,
      data: enhancedHRs
    });
  } catch (error) {
    console.error("❌ Error fetching HR accounts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching HR accounts",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// @desc    Get single HR account
// @route   GET /api/hr/:id
// @access  Private/Admin
const getHRAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "HR account not found"
      });
    }

    if (!['hr'].includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: "User is not an HR account"
      });
    }

    const profile = await Profile.findOne({ user: user._id });

    const hrData = {
      id: user._id,
      fullName: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: profile?.phone || user.phone || '',
      employeeId: profile?.professional?.employeeId || `HR${String(user._id).slice(-4)}`,
      status: user.isActive,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: profile || null
    };

    res.status(200).json({
      success: true,
      data: hrData
    });
  } catch (error) {
    console.error("❌ Error fetching HR account:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching HR account",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new HR account
// @route   POST /api/hr
// @access  Private/Admin
const createHRAccount = async (req, res) => {
  try {
    const { firstName,lastName, email, phone, employeeId, password, status, role } = req.body;

    // Validation
    const errors = [];
    
    if (!firstName) {
      errors.push({ field: "firstName", message: "First name is required" });
    }
    
    if (!email || !isValidEmail(email)) {
      errors.push({ field: "email", message: "Valid email is required" });
    }
    
    if (!password || password.length < 6) {
      errors.push({ field: "password", message: "Password must be at least 6 characters" });
    }
    
    if (!phone) {
      errors.push({ field: "phone", message: "Phone number is required" });
    }
    else if (!phone || phone.length != 10) {
      errors.push({ field: "phone", message: "Phone must be 10 characters" });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: [{ field: "email", message: "This email is already registered" }]
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with HR role
    const user = await User.create({
      firstName,
      lastName: lastName || 'HR',
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'hr',
      isActive: status || 1,
      phone: phone,
      createdBy: req.user.id
    });

    console.log("✅ HR User created:", user._id);

    // Create or update profile
    try {
      const profileData = {
        user: user._id,
        personal: {
          firstName: firstName,
          lastName: lastName || 'HR',
          email: email.toLowerCase().trim(),
          phone: phone
        },
        professional: {
          status: status || 'active',
          memberSince: new Date(),
          employeeId: employeeId || `HR${Date.now().toString().slice(-6)}`,
          department: 'Human Resources',
          role: role || 'hr'
        }
      };

      await Profile.findOneAndUpdate(
        { user: user._id },
        profileData,
        { upsert: true, new: true }
      );
      
      console.log("✅ HR Profile created successfully");
    } catch (profileError) {
      console.log("⚠️ Profile creation issue:", profileError.message);
      // Continue - user creation is more important
    }

    // Generate token for auto-login (optional)
    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "HR account created successfully",
      data: {
        token,
        user: {
          id: user._id,
          fullName: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: phone,
          role: user.role,
          status: user.status,
          employeeId: employeeId || `HR${String(user._id).slice(-4)}`,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error("❌ Error creating HR account:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry",
        errors: [{ field: "email", message: "This email is already registered" }]
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating HR account",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update HR account
// @route   PUT /api/hr/:id
// @access  Private/Admin
const updateHRAccount = async (req, res) => {
  try {
    const { fullName, email, phone, employeeId, status, role } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "HR account not found"
      });
    }

    // Parse full name if provided
    if (fullName) {
      const nameParts = fullName.trim().split(' ');
      user.firstName = nameParts[0] || user.firstName;
      user.lastName = nameParts.slice(1).join(' ') || user.lastName;
    }

    // Update email if provided and changed
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
          errors: [{ field: "email", message: "This email is already registered" }]
        });
      }
      user.email = email.toLowerCase().trim();
    }

    // Update other fields
    if (status) user.isActive = status;
    if (role) user.role = role;
    if (phone) user.phone = phone;

    user.updatedAt = Date.now();
    await user.save();

    // Update profile
    try {
      const profile = await Profile.findOne({ user: user._id });
      
      if (profile) {
        if (fullName) {
          profile.personal.firstName = user.firstName;
          profile.personal.lastName = user.lastName;
        }
        if (email) profile.personal.email = user.email;
        if (phone) profile.personal.phone = phone;
        if (employeeId && profile.professional) {
          profile.professional.employeeId = employeeId;
        }
        if (status && profile.professional) {
          profile.professional.status = status;
        }
        if (role && profile.professional) {
          profile.professional.role = role;
        }
        
        await profile.save();
      }
    } catch (profileError) {
      console.log("⚠️ Profile update issue:", profileError.message);
    }

    res.status(200).json({
      success: true,
      message: "HR account updated successfully",
      data: {
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: phone || user.phone,
        employeeId: employeeId || `HR${String(user._id).slice(-4)}`,
        status: user.status,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error("❌ Error updating HR account:", error);
    res.status(500).json({
      success: false,
      message: "Error updating HR account",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete HR account
// @route   DELETE /api/hr/:id
// @access  Private/Admin
const deleteHRAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "HR account not found"
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }

    // Delete profile first
    await Profile.findOneAndDelete({ user: user._id });
    
    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "HR account deleted successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting HR account:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting HR account",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Toggle HR account status
// @route   PATCH /api/hr/:id/toggle-status
// @access  Private/Admin
// @desc    Toggle HR account status
// @route   PATCH /api/hr/:id/toggle-status
// @access  Private/Admin
const toggleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Check for valid status values (1 for active, 0 for inactive)
    if ((status !== 1 && status !== 0)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Use 1 for active, 0 for inactive"
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "HR account not found"
      });
    }

    // Convert status to number
    const newStatus = Number(status);

    // Prevent deactivating yourself
    if (user._id.toString() === req.user.id && newStatus === 0) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account"
      });
    }

    user.isActive = newStatus;
    user.updatedAt = Date.now();
    await user.save();

    // Update profile status
    await Profile.findOneAndUpdate(
      { user: user._id },
      { 'professional.status': newStatus === 1 ? 'active' : 'inactive' }
    );

    res.status(200).json({
      success: true,
      message: `HR account ${newStatus === 1 ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        status: user.isActive
      }
    });

  } catch (error) {
    console.error("❌ Error toggling status:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling status",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// @desc    Get HR account statistics
// @route   GET /api/hr/stats
// @access  Private/Admin
const getHRStats = async (req, res) => {
  try {
    const totalHR = await User.countDocuments({ role: 'hr' });
    const activeHR = await User.countDocuments({ 
      role: 'hr',
      isActive: 1
    });
    const inactiveHR = await User.countDocuments({ 
      role: 'hr',
      isActive: 0
    });
    
    const recentHR = await User.find({ 
      role: 'hr' 
    })
    .select('firstName lastName email createdAt isActive')
    .sort('-createdAt')
    .limit(5);

    res.status(200).json({
      success: true,
      data: {
        total: totalHR,
        active: activeHR,
        inactive: inactiveHR,
        recent: recentHR.map(hr => ({
          id: hr._id,
          name: `${hr.firstName} ${hr.lastName}`,
          email: hr.email,
          status: hr.isActive === 1 ? true : false,
          createdAt: hr.createdAt
        }))
      }
    });

  } catch (error) {
    console.error("❌ Error fetching HR stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching HR statistics",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// controllers/statsController.js
const getHRSidebarStats = async (req, res) => {
  try {
    const userId = req.user.id; // Get the logged-in HR user's ID

    // Get counts for sidebar badges - filtered by createdBy
    const [
      totalCandidates,
      scheduledInterviews,
      completedInterviews,
      totalQuestions,
      totalJobRoles
    ] = await Promise.all([
      // Total candidates created by this HR
      User.countDocuments({ 
        role: 'candidate'
      }),
      
      // Scheduled interviews created by this HR
      Interview.countDocuments({ 
        createdBy: userId,
        status: 'scheduled',
        interviewDate: { $gte: new Date() }
      }),
      
      // Completed interviews created by this HR
      Interview.countDocuments({ 
        createdBy: userId,
        status: 'completed' 
      }),
      
      // Total active questions created by this HR
      Question.countDocuments({ 
        createdBy: userId,
        isActive: true 
      }),
      
      // Total active job roles created by this HR
      Role.countDocuments({ 
        createdBy: userId,
        isActive: true 
      })
    ]);

    res.json({
      success: true,
      data: {
        jobRoles: totalJobRoles,
        candidates: totalCandidates,
        scheduledInterviews: scheduledInterviews,
        completedInterviews: completedInterviews,
        totalQuestions: totalQuestions
      }
    });

  } catch (error) {
    console.error('Error fetching sidebar stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};



// @desc    Reset password for HR account
// @route   PUT /api/hr/:id/reset-password
// @access  Private/Admin
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    // Validate password
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
        errors: [{ field: "password", message: "Password is required" }]
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
        errors: [{ field: "password", message: "Password must be at least 6 characters" }]
      });
    }

    // Find the user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "HR account not found"
      });
    }

    // Check if user is HR or Admin
    if (!['hr', 'admin'].includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: "User is not an HR account"
      });
    }

    // Hash the new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    user.password = hashedPassword;
    user.updatedAt = Date.now();
    await user.save();

    console.log(`✅ Password reset for HR account: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getHRAccounts,
  getHRAccount,
  createHRAccount,
  updateHRAccount,
  deleteHRAccount,
  resetPassword,
  toggleStatus,
  getHRStats,
  getHRSidebarStats
};