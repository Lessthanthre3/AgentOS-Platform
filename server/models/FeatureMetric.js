const mongoose = require('mongoose');

const featureMetricSchema = new mongoose.Schema({
  featureName: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['usage', 'error'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  // For error tracking
  errorMessage: String,
  errorStack: String,
  // For usage tracking
  sessionId: String,
  duration: Number,
});

// Index for querying active users
featureMetricSchema.index({ featureName: 1, userId: 1, timestamp: -1 });

// Static methods for metrics calculations
featureMetricSchema.statics.getFeatureMetrics = async function(featureName, timeWindow = 24) {
  const now = new Date();
  const timeWindowStart = new Date(now - timeWindow * 60 * 60 * 1000); // Convert hours to milliseconds

  const [activeUsers, errors, totalUsage] = await Promise.all([
    // Count unique users in current session (last 30 minutes)
    this.distinct('userId', {
      featureName,
      type: 'usage',
      timestamp: { $gte: new Date(now - 30 * 60 * 1000) }
    }),

    // Count errors in the time window
    this.countDocuments({
      featureName,
      type: 'error',
      timestamp: { $gte: timeWindowStart }
    }),

    // Get total usage count for performance calculation
    this.distinct('userId', {
      featureName,
      type: 'usage',
      timestamp: { $gte: timeWindowStart }
    })
  ]);

  // Calculate performance percentage (active users / total users who attempted to use the feature)
  const totalUsers = await this.distinct('userId').count();
  const performance = totalUsers > 0 ? (totalUsage.length / totalUsers) * 100 : 0;

  return {
    activeUsers: activeUsers.length,
    errors,
    performance: Math.round(performance)
  };
};

const FeatureMetric = mongoose.model('FeatureMetric', featureMetricSchema);

module.exports = FeatureMetric;
