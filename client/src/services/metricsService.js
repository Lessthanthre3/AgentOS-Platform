import axios from 'axios';

class MetricsService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.metrics = new Map();
  }

  // Track when a user starts using a feature
  async trackFeatureUsage(featureName, userId) {
    try {
      await axios.post(`${this.baseURL}/metrics/feature-usage`, {
        featureName,
        userId,
        timestamp: new Date().toISOString(),
        action: 'start'
      });
    } catch (error) {
      console.error('Error tracking feature usage:', error);
      throw error;
    }
  }

  // Track feature errors
  async trackError(featureName, error, userId) {
    try {
      await axios.post(`${this.baseURL}/metrics/feature-error`, {
        featureName,
        userId,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error tracking feature error:', err);
      throw err;
    }
  }

  // Get metrics for all features
  async getAllMetrics() {
    try {
      const response = await axios.get(`${this.baseURL}/metrics/features`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all metrics:', error);
      // Return default metrics if server is unavailable
      return Object.fromEntries(
        Object.values(FLAGS).map(flag => [
          flag,
          { activeUsers: 0, errors: 0, performance: 0 }
        ])
      );
    }
  }

  // Get metrics for a specific feature
  async getFeatureMetrics(featureName) {
    try {
      const response = await axios.get(`${this.baseURL}/metrics/feature/${featureName}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching metrics for feature ${featureName}:`, error);
      return { activeUsers: 0, errors: 0, performance: 0 };
    }
  }
}

export const metricsService = new MetricsService();
