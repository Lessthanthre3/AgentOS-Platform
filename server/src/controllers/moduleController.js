const LearningModule = require('../models/LearningModule');

// Get all modules with optional filtering
exports.getModules = async (req, res) => {
  try {
    const { difficulty, category } = req.query;
    const query = {};
    
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;
    
    const modules = await LearningModule.find(query)
      .sort({ order: 1 })
      .select('-content.practice.questions.correctAnswer'); // Don't send answers to client
    
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching modules', error: error.message });
  }
};

// Get a single module by ID
exports.getModuleById = async (req, res) => {
  try {
    const module = await LearningModule.findOne({ moduleId: req.params.id })
      .select('-content.practice.questions.correctAnswer');
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json(module);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching module', error: error.message });
  }
};

// Get learning path (modules with prerequisites)
exports.getLearningPath = async (req, res) => {
  try {
    const modules = await LearningModule.find({})
      .select('moduleId title description prerequisites order difficulty category')
      .sort({ order: 1 });
    
    // Build adjacency list for modules
    const moduleMap = new Map(modules.map(m => [m.moduleId, {
      ...m.toObject(),
      children: []
    }]));
    
    // Build tree structure
    const roots = [];
    modules.forEach(module => {
      const moduleNode = moduleMap.get(module.moduleId);
      
      if (!module.prerequisites || module.prerequisites.length === 0) {
        roots.push(moduleNode);
      } else {
        module.prerequisites.forEach(prereqId => {
          const parent = moduleMap.get(prereqId);
          if (parent) {
            parent.children.push(moduleNode);
          }
        });
      }
    });
    
    res.json(roots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching learning path', error: error.message });
  }
};

// Submit answers for a module's questions
exports.submitAnswers = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { answers } = req.body;
    
    const module = await LearningModule.findOne({ moduleId });
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    const questions = module.content.practice.questions;
    const results = answers.map((answer, index) => ({
      correct: answer === questions[index].correctAnswer,
      explanation: questions[index].explanation
    }));
    
    const score = results.filter(r => r.correct).length / results.length * 100;
    
    res.json({
      score,
      results,
      passed: score >= 70 // Pass threshold
    });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting answers', error: error.message });
  }
};
