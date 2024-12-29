require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../src/models/LearningModule');

const moreBeginnersModules = [
  {
    moduleId: 'crypto-security-101',
    title: 'Cryptocurrency Security Essentials',
    description: 'Learn fundamental security practices to protect your crypto assets.',
    order: 5,
    category: 'security_best_practices',
    difficulty: 'beginner',
    content: {
      theory: {
        text: `Essential Cryptocurrency Security

Protecting your cryptocurrency investments requires understanding and implementing various security measures.

Key Security Principles:
1. Private Key Security
   - Never share private keys
   - Use hardware wallets for large amounts
   - Backup seed phrases safely

2. Common Threats
   - Phishing attacks
   - Malware
   - Scam projects
   - Social engineering

3. Best Practices
   - Enable 2FA everywhere
   - Use hardware security keys
   - Verify transactions carefully
   - Keep software updated

4. Red Flags to Watch For
   - Unsolicited investment advice
   - Promises of guaranteed returns
   - Pressure to act quickly
   - Requests for private keys`,
        resources: [{
          type: 'video',
          url: 'https://example.com/crypto-security-basics',
          description: 'Comprehensive guide to cryptocurrency security'
        }]
      },
      practice: {
        questions: [{
          question: 'What should you NEVER share with anyone?',
          options: [
            'Your public address',
            'Your private keys',
            'Your transaction history',
            'Your wallet software version'
          ],
          correctAnswer: 1,
          explanation: 'Private keys should never be shared as they provide complete control over your funds. Anyone with your private keys can access and transfer your cryptocurrency.'
        }],
        exercises: [{
          title: 'Security Audit Practice',
          description: 'Conduct a security audit of your practice wallet setup.',
          hints: [
            'Check for 2FA implementation',
            'Review backup procedures',
            'Assess password strength'
          ],
          solution: 'Complete security audit checklist and recommendations.'
        }]
      }
    },
    prerequisites: ['crypto-wallets-101'],
    estimatedTime: 45,
    points: 100
  },
  {
    moduleId: 'trading-basics-101',
    title: 'Introduction to Crypto Trading',
    description: 'Learn the fundamentals of cryptocurrency trading and basic market analysis.',
    order: 6,
    category: 'trading_basics',
    difficulty: 'beginner',
    content: {
      theory: {
        text: `Understanding Cryptocurrency Trading

Cryptocurrency trading involves buying and selling digital assets on various exchanges. 
This module covers the essential concepts every beginner trader should know.

Key Trading Concepts:
1. Market Basics
   - Spot trading
   - Order types (Market, Limit)
   - Trading pairs
   - Volume and liquidity

2. Basic Analysis
   - Price action
   - Support and resistance
   - Trends
   - Time frames

3. Risk Management
   - Position sizing
   - Stop losses
   - Risk-reward ratio
   - Portfolio diversification

4. Common Mistakes to Avoid
   - FOMO trading
   - Overleveraging
   - Emotional decisions
   - Lack of research`,
        resources: [{
          type: 'video',
          url: 'https://example.com/crypto-trading-101',
          description: 'Introduction to cryptocurrency trading concepts'
        }]
      },
      practice: {
        questions: [{
          question: 'What is the primary purpose of a stop-loss order?',
          options: [
            'To maximize profits',
            'To limit potential losses',
            'To increase trading volume',
            'To attract more buyers'
          ],
          correctAnswer: 1,
          explanation: 'A stop-loss order is designed to limit potential losses by automatically selling when the price reaches a predetermined level.'
        }],
        exercises: [{
          title: 'Paper Trading Simulation',
          description: 'Practice trading with virtual funds on a simulated exchange.',
          hints: [
            'Start with small position sizes',
            'Use different order types',
            'Keep a trading journal'
          ],
          solution: 'Guide to completing your first paper trades and analyzing results.'
        }]
      }
    },
    prerequisites: ['intro-to-crypto-101'],
    estimatedTime: 60,
    points: 100
  },
  {
    moduleId: 'market-analysis-101',
    title: 'Basic Market Analysis',
    description: 'Learn how to analyze cryptocurrency markets using fundamental and technical analysis.',
    order: 7,
    category: 'trading_basics',
    difficulty: 'beginner',
    content: {
      theory: {
        text: `Introduction to Market Analysis

Understanding how to analyze cryptocurrency markets is essential for making informed investment decisions.

Types of Analysis:
1. Fundamental Analysis
   - Project evaluation
   - Team assessment
   - Tokenomics
   - Use case analysis

2. Technical Analysis Basics
   - Chart patterns
   - Indicators
   - Moving averages
   - Volume analysis

3. Market Sentiment
   - Social media analysis
   - News impact
   - Market psychology
   - Sentiment indicators

4. Research Methods
   - White paper analysis
   - Community engagement
   - Development activity
   - Partnership evaluation`,
        resources: [{
          type: 'video',
          url: 'https://example.com/crypto-analysis-basics',
          description: 'Guide to basic cryptocurrency market analysis'
        }]
      },
      practice: {
        questions: [{
          question: 'Which type of analysis focuses on project fundamentals rather than price action?',
          options: [
            'Technical analysis',
            'Fundamental analysis',
            'Sentiment analysis',
            'Volume analysis'
          ],
          correctAnswer: 1,
          explanation: 'Fundamental analysis examines the underlying value of a project by evaluating factors like the team, technology, and use case, rather than focusing on price charts.'
        }],
        exercises: [{
          title: 'Project Analysis',
          description: 'Conduct a basic analysis of a real cryptocurrency project.',
          hints: [
            'Review the white paper',
            'Check GitHub activity',
            'Analyze token distribution',
            'Evaluate the team'
          ],
          solution: 'Step-by-step guide to conducting a comprehensive project analysis.'
        }]
      }
    },
    prerequisites: ['trading-basics-101'],
    estimatedTime: 75,
    points: 100
  }
];

async function createMoreBeginnerModules() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Creating additional beginner modules...');
    for (const moduleData of moreBeginnersModules) {
      const module = new LearningModule(moduleData);
      await module.save();
      console.log(`Created module: ${moduleData.moduleId}`);
    }
    
    console.log('\nAll additional beginner modules created successfully!');
    
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error creating modules:', error);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`\nValidation error for field '${key}':`);
        console.error(error.errors[key].message);
      });
    }
  }
}

createMoreBeginnerModules();
