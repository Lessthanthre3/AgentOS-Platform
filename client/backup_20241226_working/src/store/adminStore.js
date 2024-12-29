import create from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
  persist(
    (set, get) => ({
      tokens: [],
      admins: [],
      whitelistedWallets: [
        // Admin Wallets
        "25NcM1z7dxbRZE9JptiBVec9XySd8MGCnxZKMvzDP5T5",  // Admin Wallet 1
        "F2NMjJX7xHfKWfgAEv9uATcgx2nabzDFkKtk8szoJASN",  // Admin Wallet 2
        "4qKmxCGme3oDMbn5EidEJ22cMx1EWAXHsVXPMctCiHwZ",  // Admin Wallet 3
      ],
      
      // Token Management
      addToken: (token) =>
        set((state) => ({
          tokens: [...state.tokens, token],
        })),
        
      removeToken: (tokenId) =>
        set((state) => ({
          tokens: state.tokens.filter((token) => token.id !== tokenId),
        })),
        
      updateToken: (tokenId, updatedToken) =>
        set((state) => ({
          tokens: state.tokens.map((token) =>
            token.id === tokenId ? { ...token, ...updatedToken } : token
          ),
        })),
        
      // Admin Management
      addAdmin: (admin) =>
        set((state) => ({
          admins: [...state.admins, admin],
        })),
        
      removeAdmin: (adminId) =>
        set((state) => ({
          admins: state.admins.filter((admin) => admin.id !== adminId),
        })),
        
      updateAdmin: (adminId, updatedAdmin) =>
        set((state) => ({
          admins: state.admins.map((admin) =>
            admin.id === adminId ? { ...admin, ...updatedAdmin } : admin
          ),
        })),

      // Wallet Management
      addWhitelistedWallet: (walletAddress) =>
        set((state) => ({
          whitelistedWallets: [...state.whitelistedWallets, walletAddress],
        })),

      removeWhitelistedWallet: (walletAddress) =>
        set((state) => ({
          whitelistedWallets: state.whitelistedWallets.filter(
            (address) => address !== walletAddress
          ),
        })),

      isWalletWhitelisted: (walletAddress) => {
        const state = get();
        return state.whitelistedWallets.includes(walletAddress);
      },

      // Getters
      getPromotedTokens: () => {
        const state = get();
        return state.tokens.filter((token) => token.isPromoted);
      },
    }),
    {
      name: 'admin-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAdminStore;
