// controllers/authController.js - WORKING VERSION
const User = require("../models/User");
const Profile = require("../models/Profile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    // Extract parameters
    const { firstName, lastName, email, password, role } = req.body;

    // Field-specific validation
    const errors = [];
    
    if (!firstName || firstName.trim() === "") {
      errors.push({ field: "firstName", message: "First name is required" });
    } else if (firstName.trim().length < 2) {
      errors.push({ field: "firstName", message: "First name must be at least 2 characters" });
    }
    
    if (!lastName || lastName.trim() === "") {
      errors.push({ field: "lastName", message: "Last name is required" });
    } else if (lastName.trim().length < 1) {
      errors.push({ field: "lastName", message: "Last name must be at least 1 characters" });
    }
    
    if (!email || email.trim() === "") {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!isValidEmail(email)) {
      errors.push({ field: "email", message: "Please enter a valid email address" });
    }
    
    if (!password || password.trim() === "") {
      errors.push({ field: "password", message: "Password is required" });
    } else if (password.length < 6) {
      errors.push({ field: "password", message: "Password must be at least 6 characters" });
    }
    
    

    if (errors.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    // Trim values
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: [{ field: "email", message: "This email is already registered" }]
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ CREATE USER FIRST
    const user = await User.create({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      password: hashedPassword,
      role: 'candidate'
    });z

    console.log("✅ User created:", user._id);

    // ✅ CREATE PROFILE - SIMPLE VERSION WITHOUT MIDDLEWARE
    try {
      const profileData = {
        user: user._id,
        personal: {
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          email: trimmedEmail
        },
        professional: {
          status: 'Active',
          memberSince: new Date(),
          candidateId: `CAND${Date.now().toString().slice(-8)}` // Simple ID generation
        }
      };

      const profile = await Profile.create(profileData);
      console.log("✅ Profile created successfully:", profile._id);
    } catch (profileError) {
      console.log("⚠️ Profile creation had minor issue:", profileError.message);
      // Continue anyway - user registration is more important
      // Profile can be created later
    }

    // Generate token
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

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error("❌ Registration error:", error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
        errors: [{ field: "email", message: "This email is already registered" }]
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Field-specific validation for login
    const errors = [];
    
    if (!email || email.trim() === "") {
      errors.push({ field: "email", message: "Email is required" });
    } else if (!isValidEmail(email)) {
      errors.push({ field: "email", message: "Please enter a valid email address" });
    }
    
    if (!password || password.trim() === "") {
      errors.push({ field: "password", message: "Password is required" });
    }

    if (errors.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Validation failed",
        errors: errors
      });
    }

    const trimmedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(200).json({
        success: false,
        message: "Invalid credentials",
        errors: [{ field: "email", message: "No user found with this email" }]
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({
        success: false,
        message: "Invalid credentials",
        errors: [{ field: "password", message: "Incorrect password" }]
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
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

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(200).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @desc    Update user profile (name, phone)
// @route   PUT /api/profile
// @access  Private

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, currentPassword, newPassword } = req.body;
    
    // Build update object
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone) updateFields.phone = phone;

    // If password update is requested
    if (newPassword || currentPassword) {
      // Validate both fields are provided
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to change password"
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password is required"
        });
      }

      // Get user with password
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(200).json({
          success: false,
          message: "Current password is incorrect"
        });
      }

      // Validate new password length
      if (newPassword.length < 6) {
        return res.status(200).json({
          success: false,
          message: "New password must be at least 6 characters"
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(newPassword, salt);
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: newPassword ? "Profile and password updated successfully" : "Profile updated successfully",
      data: { user }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(200).json({
      success: false,
      message: "Server error"
    });
  }
};

// @desc    Change password
// @route   PUT /api/profile/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Export as object
module.exports = {
  register: registerUser,
  login: loginUser,
  getProfile,
  updateProfile,
  changePassword
};