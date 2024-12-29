import create from 'zustand';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Jupiter } from '@jup-ag/core';

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
const AIS_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_AIS_TOKEN_ADDRESS;

const useWalletStore = create((set, get) => ({
  connection: null,
  jupiter: null,
  solBalance: 0,
  aisBalance: 0,
  isLoading: false,
  transactions: [],
  activeRaffleTickets: [],

  initializeRPC: async () => {
    const connection = new Connection(SOLANA_RPC_ENDPOINT);
    const jupiter = await Jupiter.load({
      connection,
      cluster: 'mainnet-beta',
      // Add additional Jupiter configuration here
    });

    set({ connection, jupiter });
  },

  fetchBalances: async (walletAddress) => {
    const { connection } = get();
    if (!connection || !walletAddress) return;

    set({ isLoading: true });

    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(new PublicKey(walletAddress));
      
      // Fetch AIS token balance
      const aisBalance = await fetchTokenBalance(connection, walletAddress, AIS_TOKEN_ADDRESS);

      set({
        solBalance: solBalance / LAMPORTS_PER_SOL,
        aisBalance,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
      set({ isLoading: false });
    }
  },

  fetchQuote: async ({ inputMint, outputMint, amount }) => {
    const { jupiter } = get();
    if (!jupiter) throw new Error('Jupiter not initialized');

    try {
      const routes = await jupiter.computeRoutes({
        inputMint: new PublicKey(inputMint),
        outputMint: new PublicKey(outputMint),
        amount: amount * LAMPORTS_PER_SOL,
        slippageBps: 50, // 0.5% slippage
      });

      if (routes.length === 0) throw new Error('No routes found');

      const bestRoute = routes[0];
      return {
        outAmount: bestRoute.outAmount / LAMPORTS_PER_SOL,
        fee: bestRoute.fee,
        route: bestRoute,
      };
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  },

  executeSwap: async (quote) => {
    const { jupiter } = get();
    if (!jupiter) throw new Error('Jupiter not initialized');

    try {
      const { execute } = await jupiter.exchange({
        route: quote.route,
      });

      const swapResult = await execute();

      if (!swapResult.success) {
        throw new Error('Swap failed');
      }

      // Refresh balances after swap
      await get().fetchBalances();

      return swapResult;
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  },

  fetchActiveRaffleTickets: async (walletAddress) => {
    const { connection } = get();
    if (!connection || !walletAddress) return;

    set({ isLoading: true });

    try {
      // TODO: Implement the actual fetching of raffle tickets from your smart contract
      // This will need to be implemented once we have the Solana contract ready
      // For now, we'll return an empty array
      
      set({
        activeRaffleTickets: [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching raffle tickets:', error);
      set({ isLoading: false });
    }
  },

  fetchTransactions: async (walletAddress, limit = 10) => {
    const { connection } = get();
    if (!connection || !walletAddress) return;

    try {
      set({ isLoading: true });
      const signatures = await connection.getSignaturesForAddress(
        new PublicKey(walletAddress),
        { limit }
      );

      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await connection.getTransaction(sig.signature);
          return {
            signature: sig.signature,
            timestamp: sig.blockTime,
            status: tx?.meta?.err ? 'failed' : 'success',
            // Add more transaction details as needed
          };
        })
      );

      set({ transactions, isLoading: false });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ isLoading: false });
    }
  },
}));

// Helper function to fetch SPL token balance
async function fetchTokenBalance(connection, walletAddress, tokenAddress) {
  try {
    const response = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { mint: new PublicKey(tokenAddress) }
    );

    if (response.value.length === 0) return 0;

    const balance = response.value[0].account.data.parsed.info.tokenAmount;
    return balance.uiAmount;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

export default useWalletStore;
