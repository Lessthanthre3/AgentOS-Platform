const mongoose = require('mongoose');
const LearningModule = require('../models/LearningModule');
require('dotenv').config();

const modules = [
  {
    moduleId: 'nn-basics',
    title: 'Neural Network Fundamentals',
    description: 'Introduction to neural networks and their basic components',
    order: 1,
    category: 'blockchain_basics', // Using existing category for now
    difficulty: 'beginner',
    content: {
      theory: {
        text: `Neural networks are computational models inspired by the human brain. They consist of interconnected nodes (neurons) that process and transmit information.

Key Components:
1. Neurons (Nodes)
2. Weights and Connections
3. Activation Functions
4. Layers (Input, Hidden, Output)

This module will help you understand these fundamental concepts and how they work together to create intelligent systems.`,
        resources: [
          {
            type: 'video',
            url: 'https://example.com/nn-basics',
            description: 'Visual explanation of neural network basics'
          }
        ]
      },
      practice: {
        questions: [
          {
            question: 'What is the main inspiration for artificial neural networks?',
            options: [
              'Computer circuits',
              'Human brain',
              'Mathematical equations',
              'Digital logic gates'
            ],
            correctAnswer: 1,
            explanation: 'Neural networks are inspired by the biological neural networks found in human brains.'
          }
        ],
        exercises: [
          {
            title: 'Neuron Activation',
            description: 'Calculate the output of a simple neuron given input values and weights.',
            hints: [
              'Remember to sum all inputs multiplied by their weights',
              'Apply the activation function to the sum'
            ],
            solution: 'output = activation_function(sum(inputs * weights) + bias)'
          }
        ]
      }
    },
    estimatedTime: 45,
    points: 100
  },
  {
    moduleId: 'nn-architectures',
    title: 'Neural Network Architectures',
    description: 'Explore different types of neural network architectures and their applications',
    order: 2,
    category: 'blockchain_basics',
    difficulty: 'intermediate',
    content: {
      theory: {
        text: `Different neural network architectures are designed to solve specific types of problems. Let's explore the most common ones:

1. Feedforward Neural Networks (FNN)
   - Simplest architecture
   - Information flows in one direction
   - Good for basic pattern recognition

2. Convolutional Neural Networks (CNN)
   - Specialized for processing grid-like data
   - Excellent for image recognition
   - Uses convolution operations

3. Recurrent Neural Networks (RNN)
   - Designed for sequential data
   - Has memory capabilities
   - Great for time series and text

Each architecture has its strengths and ideal use cases.`,
        resources: [
          {
            type: 'article',
            url: 'https://example.com/nn-architectures',
            description: 'Comprehensive guide to neural network architectures'
          }
        ]
      },
      practice: {
        questions: [
          {
            question: 'Which neural network type is best suited for image processing?',
            options: [
              'Feedforward Neural Network',
              'Convolutional Neural Network',
              'Recurrent Neural Network',
              'Hopfield Network'
            ],
            correctAnswer: 1,
            explanation: 'CNNs are specifically designed to process grid-like data such as images.'
          }
        ],
        exercises: [
          {
            title: 'Architecture Selection',
            description: 'Given a problem description, select the most appropriate neural network architecture.',
            hints: [
              'Consider the type of input data',
              'Think about the required output',
              'Consider any temporal dependencies'
            ],
            solution: 'Match the data type and problem requirements with the architecture\'s strengths'
          }
        ]
      }
    },
    prerequisites: ['nn-basics'],
    estimatedTime: 60,
    points: 150
  }
];

async function seedModules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing modules
    await LearningModule.deleteMany({});
    console.log('Cleared existing modules');

    // Insert new modules
    await LearningModule.insertMany(modules);
    console.log('Successfully seeded modules');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding modules:', error);
    process.exit(1);
  }
}

seedModules();
