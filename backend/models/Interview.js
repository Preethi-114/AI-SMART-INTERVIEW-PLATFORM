const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  // Basic Information
  interviewTitle: {
    type: String,
    required: [true, 'Interview title is required'],
    trim: true
  },
  interviewType: {
    type: String,
    enum: ['individual', 'batch'],
    default: 'individual'
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  
  // Date & Time
  interviewDate: {
    type: Date,
    required: [true, 'Interview date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  timezone: {
    type: String,
    default: 'IST'
  },
  
  // Interview Rounds
  rounds: [{
    type: String,
    enum: ['intro', 'mcq', 'coding']
  }],
  roundSettings: {
    intro: {
      duration: { type: Number, default: 5 },
      enabled: { type: Boolean, default: true }
    },
    mcq: {
      duration: { type: Number, default: 20 },
      enabled: { type: Boolean, default: false },
      questionCount: { type: Number, default: 10 }
    },
    coding: {
      duration: { type: Number, default: 45 },
      enabled: { type: Boolean, default: false },
      language: { type: String, default: 'javascript' },
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
    }
  },
  
  // Selected Candidates
  selectedCandidates: [{
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true
    },
    name: String,
    email: String,
    phone: String,
    type: {
      type: String,
      enum: ['student', 'candidate'],
      default: 'candidate'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending'
    },
    invitationSent: {
      type: Boolean,
      default: false
    },
    invitationSentAt: Date,
    responseAt: Date,
    interviewLink: String,
    feedback: {
      rating: Number,
      comments: String,
      submittedAt: Date
    },
    notes: String
  }],
  
  // Communication (saved but not sent)
  sendEmail: {
    type: Boolean,
    default: true
  },
  sendSMS: {
    type: Boolean,
    default: false
  },
  customMessage: {
    type: String,
    trim: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: String,
  
  // Interview Results
  results: {
    totalCandidates: Number,
    confirmed: Number,
    completed: Number,
    cancelled: Number,
    noShow: Number,
    averageScore: Number,
    summary: String
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Generate interview links for candidates (instance method)
interviewSchema.methods.generateInterviewLinks = function() {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  this.selectedCandidates.forEach((candidate, index) => {
    if (!candidate.interviewLink) {
      const token = Buffer.from(`${this._id}-${candidate.candidateId}-${Date.now()}-${index}`).toString('base64');
      candidate.interviewLink = `${baseUrl}/interview/join/${token}`;
    }
  });
  return this;
};

// Calculate results (instance method)
interviewSchema.methods.calculateResults = function() {
  const total = this.selectedCandidates.length;
  const confirmed = this.selectedCandidates.filter(c => c.status === 'confirmed').length;
  const completed = this.selectedCandidates.filter(c => c.status === 'completed').length;
  const cancelled = this.selectedCandidates.filter(c => c.status === 'cancelled').length;
  const noShow = this.selectedCandidates.filter(c => c.status === 'no-show').length;
  
  const scores = this.selectedCandidates
    .filter(c => c.feedback?.rating)
    .map(c => c.feedback.rating);
  const averageScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  
  this.results = {
    totalCandidates: total,
    confirmed,
    completed,
    cancelled,
    noShow,
    averageScore: Math.round(averageScore * 100) / 100,
    summary: `${completed}/${total} completed`
  };
  return this;
};



const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;