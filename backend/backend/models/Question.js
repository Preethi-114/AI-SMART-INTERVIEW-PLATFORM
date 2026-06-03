const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['MCQ', 'True/False', 'Short-Answer', 'Coding'],
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
    default: 1
  },
  timeLimit: {
    type: Number,
    required: true,
    min: 1,
    max: 60,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Reference to Role model
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }],
  correctAnswer: {
    type: String,
    trim: true
  },
  options: [optionSchema],
  optionType: {
    type: String,
    enum: ['single', 'multiple'],
    default: 'single'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
questionSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Question', questionSchema);