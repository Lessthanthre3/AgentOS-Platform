const mongoose = require('mongoose');
const Module = require('../models/Module');
require('dotenv').config();

const modules = [
  {
    title: 'Introduction to Neural Networks',
    description: 'Learn the basics of neural networks and their applications',
    difficulty: 'beginner',
    order: 1,
    lessons: [
      {
        title: 'What are Neural Networks?',
        content: `
Neural networks are computing systems inspired by biological neural networks in animal brains. 
They are designed to recognize patterns and learn from examples, making them powerful tools for machine learning.

Key concepts:
- Neurons (nodes)
- Connections (weights)
- Layers
- Activation functions
        `,
        quiz: [
          {
            text: 'What is the main inspiration for artificial neural networks?',
            options: [
              'Computer circuits',
              'Human brain structure',
              'Mathematical equations',
              'Digital logic gates'
            ],
            correct: 1,
            explanation: 'Neural networks are inspired by the biological neural networks found in animal brains.'
          }
        ]
      }
    ]
  },
  {
    title: 'Neural Network Architecture',
    description: 'Understand different neural network architectures and their use cases',
    difficulty: 'intermediate',
    order: 2,
    lessons: [
      {
        title: 'Types of Neural Networks',
        content: `
Common neural network architectures:
1. Feedforward Neural Networks
2. Convolutional Neural Networks (CNN)
3. Recurrent Neural Networks (RNN)
4. Long Short-Term Memory (LSTM)

Each type is specialized for different tasks:
- CNNs: Image processing
- RNNs: Sequential data
- LSTMs: Long-term dependencies
        `,
        quiz: [
          {
            text: 'Which type of neural network is best suited for image processing?',
            options: [
              'Feedforward Neural Network',
              'Recurrent Neural Network',
              'Convolutional Neural Network',
              'Long Short-Term Memory'
            ],
            correct: 2,
            explanation: 'CNNs are specifically designed for processing grid-like data such as images.'
          }
        ]
      }
    ]
  }
];

async function seedModules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing modules
    await Module.deleteMany({});
    console.log('Cleared existing modules');

    // Insert new modules
    await Module.insertMany(modules);
    console.log('Seeded modules successfully');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding modules:', error);
    process.exit(1);
  }
}

seedModules();
