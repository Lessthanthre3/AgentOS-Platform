const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, required: true }
}, { _id: false });

const ExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  hints: { type: [String], default: [] },
  solution: { type: String, required: true }
}, { _id: false });

const LearningModuleSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  order: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'blockchain_basics',
      'crypto_wallets',
      'defi_fundamentals',
      'security_best_practices',
      'trading_basics'
    ]
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  content: {
    theory: {
      text: { type: String, required: true },
      resources: [ResourceSchema]
    },
    practice: {
      questions: [QuestionSchema],
      exercises: [ExerciseSchema]
    }
  },
  prerequisites: [{
    type: String,
    ref: 'LearningModule'
  }],
  estimatedTime: Number,
  points: {
    type: Number,
    default: 100
  },
  achievementId: {
    type: String,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
LearningModuleSchema.index({ category: 1, difficulty: 1, order: 1 });

module.exports = mongoose.model('LearningModule', LearningModuleSchema);
