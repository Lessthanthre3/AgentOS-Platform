const DEXSCREENER_API_BASE = 'https://api.dexscreener.com/latest';

export const DexScreenerAPI = {
  // Get token information by contract address
  async getTokenInfo(address) {
    try {
      const response = await fetch(`${DEXSCREENER_API_BASE}/dex/tokens/${address}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching token info:', error);
      throw error;
    }
  },

  // Get pair information
  async getPairInfo(pairAddress) {
    try {
      const response = await fetch(`${DEXSCREENER_API_BASE}/dex/pairs/solana/${pairAddress}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching pair info:', error);
      throw error;
    }
  },

  // Search for tokens
  async searchTokens(query) {
    try {
      const response = await fetch(`${DEXSCREENER_API_BASE}/dex/search/?q=${query}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching tokens:', error);
      throw error;
    }
  },

  // Format market data for our UI
  formatMarketData(dexData) {
    if (!dexData || !dexData.pairs || dexData.pairs.length === 0) {
      return null;
    }

    const pair = dexData.pairs[0]; // Get the most relevant pair
    return {
      price: pair.priceUsd,
      priceChange24h: pair.priceChange24h,
      volume24h: pair.volume24h,
      liquidity: pair.liquidity?.usd,
      fdv: pair.fdv,
      marketCap: pair.marketCap,
      pairAddress: pair.pairAddress,
      dexId: pair.dexId,
      url: pair.url,
      priceChart: pair.priceChart,
    };
  }
};
