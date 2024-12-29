import * as web3 from '@solana/web3.js';

// Initialize Solana connection
export const connection = new web3.Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || web3.clusterApiUrl('devnet'),
  'confirmed'
);
