const express = require('express');
const router = express.Router();
const { verifyWalletSignature } = require('../middleware/auth');
const UserProgress = require('../models/UserProgress');
const ProgressSyncService = require('../services/ProgressSyncService');

const progressSync = new ProgressSyncService(
  process.env.LEARNING_PROGRAM_ID,
  process.env.SOLANA_RPC_URL
);

// Get user's learning status
router.get('/status', verifyWalletSignature, async (req, res) => {
  try {
    const progress = await progressSync.syncUserProgress(req.walletAddress);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch learning status' });
  }
});

// Update module progress
router.post('/progress', verifyWalletSignature, async (req, res) => {
  try {
    const progress = await progressSync.saveProgress(req.walletAddress, req.body);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get recommended next topics
router.get('/recommendations', verifyWalletSignature, async (req, res) => {
  try {
    const userProgress = await UserProgress.findOne({ walletAddress: req.walletAddress });
    if (!userProgress) {
      return res.json({
        topics: ['blockchain_basics'], // Default starting point
        difficulty: 'easy'
      });
    }

    const learningModel = new LearningModel();
    await learningModel.initialize();
    
    const nextTopics = await learningModel.predictNextTopic(userProgress);
    const difficulty = await learningModel.adjustDifficulty(userProgress);

    res.json({ topics: nextTopics, difficulty });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;
