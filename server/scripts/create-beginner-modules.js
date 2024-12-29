require('dotenv').config();
const mongoose = require('mongoose');
const LearningModule = require('../src/models/LearningModule');

const beginnerModules = [
  {
    moduleId: 'crypto-wallets-101',
    title: 'Understanding Crypto Wallets',
    description: 'Learn about different types of cryptocurrency wallets and how to use them safely.',
    order: 2,
    category: 'crypto_wallets',
    difficulty: 'beginner',
    content: {
      theory: {
        text: `What is a Crypto Wallet?

A cryptocurrency wallet is a digital tool that allows you to store, send, and receive cryptocurrencies. 
Unlike traditional wallets that hold physical cash, crypto wallets store private keys - the crucial 
piece of information that gives you access to your cryptocurrency on the blockchain.

Types of Wallets:
1. Hot Wallets (Online)
   - Mobile wallets
   - Web wallets
   - Desktop wallets

2. Cold Wallets (Offline)
   - Hardware wallets
   - Paper wallets

Key Security Concepts:
- Private Keys
- Public Keys
- Seed Phrases
- Wallet Addresses`,
        resources: [{
          type: 'video',
          url: 'https://example.com/crypto-wallets-guide',
          description: 'Visual guide to different types of crypto wallets'
        }]
      },
      practice: {
        questions: [{
          question: 'Which type of wallet is generally considered more secure for long-term storage?',
          options: [
            'Hot wallet',
            'Cold wallet',
            'Web wallet',
            'Mobile wallet'
          ],
          correctAnswer: 1,
          explanation: 'Cold wallets (offline storage) are generally more secure as they\'re not connected to the internet, reducing the risk of online threats.'
        }],
        exercises: [{
          title: 'Secure Your First Wallet',
          description: 'Create a practice wallet and learn how to properly secure your seed phrase.',
          hints: [
            'Never share your seed phrase with anyone',
            'Store your seed phrase in a secure, offline location',
            'Consider using a hardware wallet for large amounts'
          ],
          solution: 'Detailed guide on wallet security best practices.'
        }]
      }
    },
    prerequisites: ['intro-to-crypto-101'],
    estimatedTime: 45,
    points: 100
  },
  {
    moduleId: 'blockchain-basics-101',
    title: 'Blockchain Fundamentals',
    description: 'Understand how blockchain technology works and its key components.',
    order: 3,
    category: 'blockchain_basics',
    difficulty: 'beginner',
    content: {
      theory: {
        text: `Understanding Blockchain Technology

A blockchain is a distributed digital ledger that stores data in blocks that are linked together 
chronologically. Each block contains:
- Transaction data
- Timestamp
- Cryptographic hash of the previous block

Key Concepts:
1. Decentralization
   - No single point of control
   - Network of nodes maintains the ledger

2. Immutability
   - Once recorded, data cannot be changed
   - Creates trust through transparency

3. Consensus Mechanisms
   - Proof of Work (PoW)
   - Proof of Stake (PoS)
   - And others...

4. Smart Contracts
   - Self-executing contracts
   - Automated, trustless transactions`,
        resources: [{
          type: 'video',
          url: 'https://example.com/blockchain-visual-guide',
          description: 'Animated explanation of blockchain technology'
        }]
      },
      practice: {
        questions: [{
          question: 'What makes blockchain technology immutable?',
          options: [
            'Government regulations',
            'Cryptographic linking of blocks',
            'Internet connectivity',
            'Computer processing power'
          ],
          correctAnswer: 1,
          explanation: 'The cryptographic linking of blocks makes it practically impossible to alter past records without detection, ensuring immutability.'
        }],
        exercises: [{
          title: 'Explore a Blockchain',
          description: 'Use a blockchain explorer to examine real transactions and blocks on the Solana network.',
          hints: [
            'Start with Solana Explorer',
            'Look at transaction details',
            'Understand block structure'
          ],
          solution: 'Step-by-step guide to using Solana Explorer and understanding blockchain data.'
        }]
      }
    },
    prerequisites: ['intro-to-crypto-101'],
    estimatedTime: 60,
    points: 100
  },
  {
    moduleId: 'defi-intro-101',
    title: 'Introduction to DeFi',
    description: 'Learn the basics of Decentralized Finance and its core concepts.',
    order: 4,
    category: 'defi_fundamentals',
    difficulty: 'beginner',
    content: {
      theory: {
        text: `What is DeFi (Decentralized Finance)?

DeFi refers to financial services and products built on blockchain technology that operate without 
traditional financial intermediaries like banks or brokerages.

Core DeFi Concepts:
1. Lending and Borrowing
   - Peer-to-peer lending
   - Collateralized loans
   - Interest rates

2. Decentralized Exchanges (DEX)
   - Automated Market Makers (AMM)
   - Liquidity Pools
   - Token Swaps

3. Yield Farming
   - Liquidity Mining
   - Staking
   - Rewards

4. Smart Contract Security
   - Risk Assessment
   - Audits
   - Best Practices`,
        resources: [{
          type: 'video',
          url: 'https://example.com/defi-explained',
          description: 'Comprehensive introduction to DeFi concepts'
        }]
      },
      practice: {
        questions: [{
          question: 'What is the main advantage of using a DEX over a centralized exchange?',
          options: [
            'Faster transaction speed',
            'Lower fees',
            'Non-custodial trading',
            'Better user interface'
          ],
          correctAnswer: 2,
          explanation: 'DEXs allow non-custodial trading, meaning users maintain control of their funds throughout the trading process, enhancing security and reducing counterparty risk.'
        }],
        exercises: [{
          title: 'DeFi Simulation',
          description: 'Practice using a DEX on Solana\'s devnet to understand token swaps and liquidity pools.',
          hints: [
            'Use devnet tokens only',
            'Start with small amounts',
            'Compare different pools'
          ],
          solution: 'Interactive guide to completing your first DEX swap on Solana devnet.'
        }]
      }
    },
    prerequisites: ['blockchain-basics-101'],
    estimatedTime: 75,
    points: 100
  }
];

async function createBeginnerModules() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Creating beginner modules...');
    for (const moduleData of beginnerModules) {
      const module = new LearningModule(moduleData);
      await module.save();
      console.log(`Created module: ${moduleData.moduleId}`);
    }
    
    console.log('\nAll beginner modules created successfully!');
    
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

createBeginnerModules();
