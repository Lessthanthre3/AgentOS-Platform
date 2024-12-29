const FeatureMetric = require('../models/FeatureMetric');

class MetricsService {
  async trackFeatureUsage(featureName, userId, sessionId) {
    try {
      await FeatureMetric.create({
        featureName,
        userId,
        sessionId,
        type: 'usage',
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error tracking feature usage:', error);
      throw error;
    }
  }

  async trackFeatureError(featureName, userId, error) {
    try {
      await FeatureMetric.create({
        featureName,
        userId,
        type: 'error',
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error tracking feature error:', err);
      throw err;
    }
  }

  async getFeatureMetrics(featureName) {
    try {
      return await FeatureMetric.getFeatureMetrics(featureName);
    } catch (error) {
      console.error('Error getting feature metrics:', error);
      throw error;
    }
  }

  async getAllFeatureMetrics(features) {
    try {
      const metrics = {};
      await Promise.all(
        features.map(async (feature) => {
          metrics[feature] = await this.getFeatureMetrics(feature);
        })
      );
      return metrics;
    } catch (error) {
      console.error('Error getting all feature metrics:', error);
      throw error;
    }
  }

  // Clean up old metrics data (can be run periodically)
  async cleanupOldMetrics(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      await FeatureMetric.deleteMany({
        timestamp: { $lt: cutoffDate }
      });
    } catch (error) {
      console.error('Error cleaning up old metrics:', error);
      throw error;
    }
  }
}

module.exports = new MetricsService();
