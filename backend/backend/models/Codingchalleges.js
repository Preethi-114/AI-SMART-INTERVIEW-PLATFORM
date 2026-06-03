const mongoose = require('mongoose');

const codingChallengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  timeLimit: { type: Number, default: 30 }, // minutes
  
  // Starter code for different languages
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String,
    php: String,
    ruby: String,
    swift: String
  },
  
  // Test cases
  testCases: [{
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    description: String,
    isHidden: { type: Boolean, default: false }
  }],
  
  // Constraints
  constraints: [String],
  
  // Examples
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  
  // Hints
  hints: [String],
  
  // Solution
  solution: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  
  // Metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CodingChallenge', codingChallengeSchema);