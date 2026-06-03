// models/CodingChallenge.js
const mongoose = require('mongoose');

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const TestCaseSchema = new mongoose.Schema({
  input:          { type: String, required: true },
  expectedOutput: { type: String, required: true },  // controller maps this → expected
  explanation:    { type: String },
  isHidden:       { type: Boolean, default: false },  // hidden = not shown to candidate
}, { _id: false });

const ExampleSchema = new mongoose.Schema({
  input:       { type: String, required: true },
  output:      { type: String, required: true },
  explanation: { type: String },
}, { _id: false });

// starterCode per language: { javascript: '...', python: '...', ... }
const StarterCodeSchema = new mongoose.Schema({
  javascript: { type: String, default: '' },
  python:     { type: String, default: '' },
  java:       { type: String, default: '' },
  cpp:        { type: String, default: '' },
  typescript: { type: String, default: '' },
}, { _id: false });

// ── Main schema ───────────────────────────────────────────────────────────────

const CodingChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
  },

  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },

  category: {
    type: String,
    default: 'General',
    // e.g. 'Arrays', 'Strings', 'Dynamic Programming', 'Trees', 'Graphs'
  },

  tags: {
    type: [String],
    default: [],
  },

  // What the candidate sees as examples (not evaluated)
  examples: {
    type: [ExampleSchema],
    default: [],
  },

  // Problem constraints shown to candidate
  constraints: {
    type: [String],
    default: [],
  },

  // Test cases used for evaluation
  testCases: {
    type: [TestCaseSchema],
    default: [],
  },

  // Starter/boilerplate code per language
  starterCode: {
    type: StarterCodeSchema,
    default: () => ({}),
  },

  // Reference solution (never sent to candidate — stripped in controller)
  solution: {
    type: String,
    select: false,   // excluded from all queries by default
  },

  solutionLanguage: {
    type: String,
    default: 'javascript',
  },

  // Time allowed for this challenge (minutes)
  timeLimit: {
    type: Number,
    default: 40,
  },

  // Max memory in MB
  memoryLimit: {
    type: Number,
    default: 256,
  },

  // Points for this challenge
  points: {
    type: Number,
    default: 100,
  },

  // Who created this challenge
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  // Usage stats
  timesUsed: {
    type: Number,
    default: 0,
  },

  avgScore: {
    type: Number,
    default: 0,
  },

}, {
  timestamps: true,
});

// ── Indexes ───────────────────────────────────────────────────────────────────
CodingChallengeSchema.index({ difficulty: 1, isActive: 1 });
CodingChallengeSchema.index({ tags: 1 });
CodingChallengeSchema.index({ category: 1, difficulty: 1 });
CodingChallengeSchema.index({ createdBy: 1 });

module.exports = mongoose.model('CodingChallenge', CodingChallengeSchema);