require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../src/models/LearningModule');

const testModule = {
  moduleId: 'intro-to-crypto-101',
  title: 'Introduction to Cryptocurrency',
  description: 'Learn the basic concepts of cryptocurrency and blockchain technology.',
  order: 1,
  category: 'blockchain_basics',
  difficulty: 'beginner',
  content: {
    theory: {
      text: `What is Cryptocurrency?
        
        Cryptocurrency is a digital or virtual form of currency that uses cryptography for security. 
        Unlike traditional currencies issued by central banks, cryptocurrencies are typically 
        decentralized systems based on blockchain technology.
        
        Key Concepts:
        1. Decentralization
        2. Blockchain Technology
        3. Digital Scarcity
        4. Cryptographic Security`,
      resources: [{
        type: 'video',
        url: 'https://example.com/intro-to-crypto',
        description: 'Visual explanation of cryptocurrency basics'
      }]
    },
    practice: {
      questions: [{
        question: 'What is the main technology behind cryptocurrencies?',
        options: [
          'Traditional databases',
          'Blockchain technology',
          'Cloud computing',
          'Artificial Intelligence'
        ],
        correctAnswer: 1,
        explanation: 'Blockchain technology is the fundamental innovation that enables cryptocurrencies to function in a decentralized manner.'
      }],
      exercises: [{
        title: 'Create Your First Wallet',
        description: 'Follow the steps to create a practice wallet on the Solana devnet.',
        hints: [
          'Make sure you\'re on the devnet network',
          'Keep your seed phrase safe (this is just practice, but good habits start early)'
        ],
        solution: 'Step-by-step wallet creation process will be shown after attempt.'
      }]
    }
  },
  prerequisites: [],
  estimatedTime: 30,
  points: 100
};

async function createTestModule() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Creating test module...');
    const module = new LearningModule(testModule);
    await module.save();
    
    console.log('Test module created successfully!');
    console.log('Module ID:', module.moduleId);
    
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error creating test module:', error);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`\nValidation error for field '${key}':`);
        console.error(error.errors[key].message);
      });
    }
  }
}

createTestModule();
