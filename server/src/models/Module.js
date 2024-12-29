const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  content: {
    type: String,
    required: true
  },
  theory: {
    type: String,
    required: true
  },
  practice: {
    type: String,
    required: true
  },
  exercises: [{
    type: String
  }],
  order: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Module', moduleSchema);
