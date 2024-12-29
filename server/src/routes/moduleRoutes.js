const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');

// Get all modules (with optional filtering)
router.get('/', moduleController.getModules);

// Get learning path
router.get('/learning-path', moduleController.getLearningPath);

// Get specific module
router.get('/:id', moduleController.getModuleById);

// Submit answers for a module
router.post('/:moduleId/submit', moduleController.submitAnswers);

module.exports = router;
