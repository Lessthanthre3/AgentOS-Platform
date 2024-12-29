const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Overall Progress
  totalScore: { type: Number, default: 0 },
  completedModules: [String],
  currentModule: String,
  lastActive: { type: Date, default: Date.now },
  
  // Learning Metrics
  metrics: {
    cryptoTerminologyScore: { type: Number, default: 0 },
    practicalApplicationScore: { type: Number, default: 0 },
    securityAwarenessScore: { type: Number, default: 0 },
    marketUnderstandingScore: { type: Number, default: 0 },
    technicalConceptScore: { type: Number, default: 0 }
  },
  
  // Module Progress
  moduleProgress: [{
    moduleId: String,
    status: { type: String, enum: ['not_started', 'in_progress', 'completed'] },
    score: Number,
    attempts: Number,
    timeSpent: Number,
    lastAttempt: Date,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] }
  }],
  
  // Learning Path
  learningPath: {
    currentTopic: String,
    completedTopics: [String],
    recommendedTopics: [String],
    customizedDifficulty: String
  },
  
  // Achievement NFTs
  achievements: [{
    nftAddress: String,
    achievement: String,
    dateEarned: Date,
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // ML Model State
  mlState: {
    userFeatures: [Number],
    lastPredictions: {
      comprehension: Number,
      engagement: Number,
      retention: Number,
      cryptoConfidence: Number
    },
    preferredLearningStyle: String
  }
}, {
  timestamps: true
});

// Indexes for quick queries
UserProgressSchema.index({ 'moduleProgress.moduleId': 1 });
UserProgressSchema.index({ 'achievements.nftAddress': 1 });

module.exports = mongoose.model('UserProgress', UserProgressSchema);
