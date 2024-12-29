const config = {
  // Main Environment
  main: {
    port: 3001,
    mongodb: {
      uri: process.env.MONGODB_URI_PROD || 'mongodb://localhost:27017/agentos',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    solana: {
      network: 'devnet',
      programId: process.env.PROGRAM_ID
    }
  },

  // Beta/Parallel Environment
  beta: {
    port: 3002,
    mongodb: {
      uri: process.env.MONGODB_URI_BETA || 'mongodb://localhost:27017/agentos_beta',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    solana: {
      network: 'devnet',
      programId: process.env.BETA_PROGRAM_ID
    }
  },

  // Feature Flags Configuration
  features: {
    sentinel: process.env.ENABLE_SENTINEL === 'true',
    alphaCalendar: process.env.ENABLE_ALPHA_CALENDAR === 'true',
    rewards: process.env.ENABLE_REWARDS === 'true',
    betaTesting: process.env.ENABLE_BETA_TESTING === 'true'
  },

  // Beta Testing Configuration
  betaTesting: {
    maxUsers: 100,
    allowedFeatures: ['sentinel', 'alphaCalendar'],
    dataCollection: true,
    feedbackEnabled: true
  }
};

module.exports = config;
