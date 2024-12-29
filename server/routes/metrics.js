const express = require('express');
const router = express.Router();
const FeatureMetric = require('../models/FeatureMetric');
const metricsService = require('../services/metricsService');
const { authenticateUser, isAdmin } = require('../middleware/auth');

// Track feature usage
router.post('/feature-usage', authenticateUser, async (req, res) => {
  try {
    const { featureName, sessionId } = req.body;
    const userId = req.user.id;

    await metricsService.trackFeatureUsage(featureName, userId, sessionId);
    res.status(200).json({ message: 'Feature usage tracked successfully' });
  } catch (error) {
    console.error('Error in /feature-usage:', error);
    res.status(500).json({ error: 'Failed to track feature usage' });
  }
});

// Track feature errors
router.post('/feature-error', authenticateUser, async (req, res) => {
  try {
    const { featureName, error } = req.body;
    const userId = req.user.id;

    await metricsService.trackFeatureError(featureName, userId, error);
    res.status(200).json({ message: 'Feature error tracked successfully' });
  } catch (error) {
    console.error('Error in /feature-error:', error);
    res.status(500).json({ error: 'Failed to track feature error' });
  }
});

// Get metrics for a specific feature (admin only)
router.get('/feature/:name', authenticateUser, isAdmin, async (req, res) => {
  try {
    const metrics = await metricsService.getFeatureMetrics(req.params.name);
    res.json(metrics);
  } catch (error) {
    console.error('Error in /feature/:name:', error);
    res.status(500).json({ error: 'Failed to get feature metrics' });
  }
});

// Get all feature metrics
router.get('/features', async (req, res) => {
  try {
    // Get metrics for all features
    const metrics = await FeatureMetric.aggregate([
      {
        $group: {
          _id: '$featureName',
          activeUsers: {
            $addToSet: {
              $cond: [
                { $gt: ['$timestamp', new Date(Date.now() - 30 * 60 * 1000)] },
                '$userId',
                null
              ]
            }
          },
          errors: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'error'] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          featureName: '$_id',
          activeUsers: { $size: { $filter: { input: '$activeUsers', as: 'user', cond: { $ne: ['$$user', null] } } } },
          errors: 1,
          performance: { $multiply: [{ $divide: ['$activeUsers', { $add: ['$activeUsers', '$errors'] }] }, 100] }
        }
      }
    ]);

    // Convert array to object with feature names as keys
    const metricsObject = metrics.reduce((acc, metric) => {
      acc[metric.featureName] = {
        activeUsers: metric.activeUsers,
        errors: metric.errors,
        performance: metric.performance || 0
      };
      return acc;
    }, {});

    res.json(metricsObject);
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Track feature usage
router.post('/feature-usage-new', async (req, res) => {
  try {
    const { featureName, userId, timestamp } = req.body;
    await FeatureMetric.create({
      featureName,
      userId,
      type: 'usage',
      timestamp: timestamp || new Date()
    });
    res.status(200).json({ message: 'Usage tracked successfully' });
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

// Track feature errors
router.post('/feature-error-new', async (req, res) => {
  try {
    const { featureName, userId, error, stack, timestamp } = req.body;
    await FeatureMetric.create({
      featureName,
      userId,
      type: 'error',
      errorMessage: error,
      errorStack: stack,
      timestamp: timestamp || new Date()
    });
    res.status(200).json({ message: 'Error tracked successfully' });
  } catch (error) {
    console.error('Error tracking error:', error);
    res.status(500).json({ error: 'Failed to track error' });
  }
});

// Get metrics for all features (admin only)
router.get('/features-admin', authenticateUser, isAdmin, async (req, res) => {
  try {
    const features = req.query.features?.split(',') || Object.values(req.app.locals.featureFlags);
    const metrics = await metricsService.getAllFeatureMetrics(features);
    res.json(metrics);
  } catch (error) {
    console.error('Error in /features:', error);
    res.status(500).json({ error: 'Failed to get all feature metrics' });
  }
});

// Cleanup old metrics (admin only)
router.post('/cleanup', authenticateUser, isAdmin, async (req, res) => {
  try {
    const { daysToKeep = 30 } = req.body;
    await metricsService.cleanupOldMetrics(daysToKeep);
    res.json({ message: 'Old metrics cleaned up successfully' });
  } catch (error) {
    console.error('Error in /cleanup:', error);
    res.status(500).json({ error: 'Failed to cleanup old metrics' });
  }
});

module.exports = router;
