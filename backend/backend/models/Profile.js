// models/Profile.js - CLEAN VERSION (No middleware)
const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  degree: String,
  field: String,
  institution: String,
  year: String,
  grade: String,
  description: String
}, { timestamps: true });

const resumeSchema = new mongoose.Schema({
  fileName: String,
  fileSize: String,
  fileType: String,
  storagePath: String,
  publicUrl: String,
  uploadedAt: Date,
  lastUpdated: Date
});

const skillSchema = new mongoose.Schema({
  name: String,
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  years: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personal: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    gender: String,
    dateOfBirth: Date,
    profilePhoto: String
  },
  professional: {
      title: String,
      experience: String,
      experienceLevel: String,
      currentCompany: String,
      currentSalary: String,
      department: String,
      employmentType: String,
      expectedSalary: String,
      industry: String,
      noticePeriod: String,
      availability: String,
      candidateId: String,
      status: {
          type: String,
          default: 'Active'
      },
      memberSince: {
          type: Date,
          default: Date.now
      }
  },
  education: [educationSchema],
  skills: [skillSchema],
  resume: resumeSchema
}, {
  timestamps: true
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;