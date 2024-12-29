export const curriculum = {
  beginner: {
    title: "Cryptocurrency Fundamentals",
    modules: [
      {
        id: "intro-blockchain",
        title: "Introduction to Blockchain",
        lessons: [
          { title: "What is Blockchain Technology?", duration: "15min" },
          { title: "Understanding Decentralization", duration: "20min" },
          { title: "Introduction to Solana", duration: "25min" },
        ]
      },
      {
        id: "crypto-basics",
        title: "Cryptocurrency Basics",
        lessons: [
          { title: "What are Cryptocurrencies?", duration: "20min" },
          { title: "Understanding Wallets", duration: "25min" },
          { title: "Security Best Practices", duration: "30min" },
        ]
      },
      {
        id: "solana-ecosystem",
        title: "Solana Ecosystem",
        lessons: [
          { title: "Solana Architecture", duration: "25min" },
          { title: "SPL Tokens Explained", duration: "20min" },
          { title: "Popular Solana DEXes", duration: "30min" },
        ]
      }
    ]
  },
  intermediate: {
    title: "Trading Fundamentals",
    modules: [
      {
        id: "market-basics",
        title: "Market Fundamentals",
        lessons: [
          { title: "Understanding Market Cap", duration: "20min" },
          { title: "Volume Analysis", duration: "25min" },
          { title: "Liquidity Indicators", duration: "30min" },
        ]
      },
      {
        id: "technical-analysis",
        title: "Technical Analysis",
        lessons: [
          { title: "Chart Patterns", duration: "35min" },
          { title: "Key Indicators", duration: "40min" },
          { title: "Support and Resistance", duration: "30min" },
        ]
      },
      {
        id: "risk-management",
        title: "Risk Management",
        lessons: [
          { title: "Position Sizing", duration: "25min" },
          { title: "Stop Loss Strategies", duration: "30min" },
          { title: "Portfolio Management", duration: "35min" },
        ]
      }
    ]
  },
  advanced: {
    title: "Advanced Trading Strategies",
    modules: [
      {
        id: "advanced-ta",
        title: "Advanced Technical Analysis",
        lessons: [
          { title: "Advanced Chart Patterns", duration: "40min" },
          { title: "Multiple Timeframe Analysis", duration: "45min" },
          { title: "Market Psychology", duration: "35min" },
        ]
      },
      {
        id: "defi-strategies",
        title: "DeFi Trading Strategies",
        lessons: [
          { title: "Yield Farming", duration: "40min" },
          { title: "Liquidity Provision", duration: "45min" },
          { title: "Arbitrage Opportunities", duration: "50min" },
        ]
      },
      {
        id: "algo-trading",
        title: "Algorithmic Trading",
        lessons: [
          { title: "Bot Trading Basics", duration: "45min" },
          { title: "Strategy Automation", duration: "50min" },
          { title: "Risk Management Automation", duration: "40min" },
        ]
      }
    ]
  },
  expert: {
    title: "Professional Trading",
    modules: [
      {
        id: "market-making",
        title: "Market Making",
        lessons: [
          { title: "Market Making Strategies", duration: "50min" },
          { title: "Spread Management", duration: "45min" },
          { title: "Risk Management for Market Makers", duration: "55min" },
        ]
      },
      {
        id: "institutional",
        title: "Institutional Trading",
        lessons: [
          { title: "OTC Trading", duration: "45min" },
          { title: "Dark Pool Trading", duration: "50min" },
          { title: "Block Trade Management", duration: "55min" },
        ]
      }
    ]
  }
};
