require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../src/models/LearningModule');

const intermediateModules = [
  {
    moduleId: 'defi-strategies-201',
    title: 'Advanced DeFi Strategies',
    description: 'Learn advanced DeFi concepts and yield optimization strategies.',
    order: 8,
    category: 'defi_fundamentals',
    difficulty: 'intermediate',
    content: {
      theory: {
        text: `Advanced DeFi Strategies

Building on your basic DeFi knowledge, we'll explore more advanced concepts and strategies.

Advanced Topics:
1. Yield Optimization
   - Yield aggregators
   - Auto-compounding
   - Risk assessment
   - APY vs APR

2. Liquidity Provision
   - Impermanent loss
   - Pool selection
   - Risk management
   - Fee optimization

3. Flash Loans
   - Mechanics
   - Use cases
   - Risk factors
   - Implementation

4. Cross-chain DeFi
   - Bridge mechanics
   - Security considerations
   - Opportunity analysis`,
        resources: [{
          type: 'video',
          url: 'https://example.com/advanced-defi',
          description: 'Deep dive into advanced DeFi strategies'
        }]
      },
      practice: {
        questions: [{
          question: 'What is impermanent loss in liquidity provision?',
          options: [
            'Lost tokens due to hacking',
            'Price change losses compared to holding',
            'Transaction fees',
            'Network downtime losses'
          ],
          correctAnswer: 1,
          explanation: 'Impermanent loss occurs when the price ratio of pooled tokens changes compared to when they were deposited, potentially resulting in less value than simply holding.'
        }],
        exercises: [{
          title: 'Yield Strategy Simulation',
          description: 'Create and analyze different yield farming strategies.',
          hints: [
            'Consider gas costs',
            'Calculate real yields',
            'Account for risks'
          ],
          solution: 'Detailed walkthrough of yield strategy optimization.'
        }]
      }
    },
    prerequisites: ['defi-intro-101'],
    estimatedTime: 90,
    points: 150
  },
  {
    moduleId: 'technical-analysis-201',
    title: 'Advanced Technical Analysis',
    description: 'Master advanced technical analysis techniques for cryptocurrency trading.',
    order: 9,
    category: 'trading_basics',
    difficulty: 'intermediate',
    content: {
      theory: {
        text: `Advanced Technical Analysis

Dive deep into technical analysis techniques specifically tailored for cryptocurrency markets.

Key Concepts:
1. Advanced Chart Patterns
   - Harmonic patterns
   - Elliott Wave Theory
   - Wyckoff Method
   - Volume Profile

2. Advanced Indicators
   - RSI Divergence
   - MACD Strategies
   - Ichimoku Cloud
   - Order Flow Analysis

3. Market Structure
   - Supply and demand zones
   - Market phases
   - Liquidity analysis
   - Order block theory

4. Risk Management
   - Position sizing models
   - Portfolio heat
   - Correlation analysis
   - Draw-down management`,
        resources: [{
          type: 'video',
          url: 'https://example.com/advanced-ta',
          description: 'Comprehensive guide to advanced technical analysis'
        }]
      },
      practice: {
        questions: [{
          question: 'What does RSI divergence indicate?',
          options: [
            'Immediate price reversal',
            'Potential trend weakness',
            'Guaranteed profit opportunity',
            'Market manipulation'
          ],
          correctAnswer: 1,
          explanation: 'RSI divergence indicates potential trend weakness and possible reversal, though it should be confirmed with other indicators and patterns.'
        }],
        exercises: [{
          title: 'Pattern Recognition',
          description: 'Identify and analyze advanced chart patterns in real market conditions.',
          hints: [
            'Look for multiple timeframe confirmation',
            'Consider volume analysis',
            'Wait for pattern completion'
          ],
          solution: 'Step-by-step guide to pattern identification and trading.'
        }]
      }
    },
    prerequisites: ['market-analysis-101'],
    estimatedTime: 120,
    points: 150
  },
  {
    moduleId: 'smart-contract-security-201',
    title: 'Smart Contract Security',
    description: 'Learn to identify and prevent common smart contract vulnerabilities.',
    order: 10,
    category: 'security_best_practices',
    difficulty: 'intermediate',
    content: {
      theory: {
        text: `Smart Contract Security

Understanding smart contract security is crucial for anyone involved in DeFi or blockchain development.

Security Topics:
1. Common Vulnerabilities
   - Reentrancy attacks
   - Integer overflow/underflow
   - Front-running
   - Access control issues

2. Security Best Practices
   - Code auditing
   - Testing methodologies
   - Upgrade patterns
   - Emergency procedures

3. Analysis Tools
   - Static analyzers
   - Security frameworks
   - Monitoring tools
   - Testing suites

4. Risk Assessment
   - Security scoring
   - Red flags
   - Due diligence
   - Incident response`,
        resources: [{
          type: 'video',
          url: 'https://example.com/smart-contract-security',
          description: 'In-depth guide to smart contract security'
        }]
      },
      practice: {
        questions: [{
          question: 'What is a reentrancy attack?',
          options: [
            'Network downtime',
            'Recursive contract calls',
            'Password theft',
            'Token burning'
          ],
          correctAnswer: 1,
          explanation: 'A reentrancy attack occurs when a contract function is called recursively before the first invocation is finished, potentially leading to unauthorized withdrawals.'
        }],
        exercises: [{
          title: 'Security Audit',
          description: 'Conduct a security audit on a sample smart contract.',
          hints: [
            'Check state changes',
            'Verify access controls',
            'Look for common vulnerabilities'
          ],
          solution: 'Comprehensive guide to conducting a smart contract security audit.'
        }]
      }
    },
    prerequisites: ['crypto-security-101', 'blockchain-basics-101'],
    estimatedTime: 150,
    points: 200
  }
];

async function createIntermediateModules() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Creating intermediate modules...');
    for (const moduleData of intermediateModules) {
      const module = new LearningModule(moduleData);
      await module.save();
      console.log(`Created module: ${moduleData.moduleId}`);
    }
    
    console.log('\nAll intermediate modules created successfully!');
    
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

createIntermediateModules();
