const express = require('express');
const router = express.Router();
const Module = require('../models/Module');

// Get all modules
router.get('/', async (req, res) => {
  try {
    const modules = await Module.find()
      .sort('order')
      .select('-lessons.quiz.correct'); // Don't send correct answers to client
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get a specific module
router.get('/:id', async (req, res) => {
  try {
    const module = await Module.findById(req.params.id)
      .select('-lessons.quiz.correct');
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }
    res.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// Verify quiz answers
router.post('/:id/verify', async (req, res) => {
  try {
    const { lessonIndex, answers } = req.body;
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const lesson = module.lessons[lessonIndex];
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const results = answers.map((answer, index) => {
      const question = lesson.quiz[index];
      return {
        correct: question.correct === answer,
        explanation: question.explanation
      };
    });

    res.json({
      results,
      score: (results.filter(r => r.correct).length / results.length) * 100
    });
  } catch (error) {
    console.error('Error verifying answers:', error);
    res.status(500).json({ error: 'Failed to verify answers' });
  }
});

module.exports = router;
