import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
      
      adminToken: null,
      isAdmin: false,

      // Token Management
      fetchTokens: async () => {
        try {
          // For now, we'll just use the existing tokens in the store
          // In production, this would make an API call to fetch tokens
          return get().tokens;
        } catch (error) {
          console.error('Error fetching tokens:', error);
          return [];
        }
      },

      addToken: (token) =>
        set((state) => ({
          tokens: [...state.tokens, { ...token, id: Date.now().toString() }],
        })),
        
      removeToken: (tokenId) =>
        set((state) => ({
          tokens: state.tokens.filter((token) => token.id !== tokenId),
        })),
        
      updateToken: (token) =>
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === token.id ? token : t
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
        // Temporarily allow all wallets
        return true;
      },

      // Admin Authentication
      setAdminToken: (token) => 
        set({ adminToken: token, isAdmin: true }),

      clearAdminToken: () => 
        set({ adminToken: null, isAdmin: false }),

      getAuthHeaders: () => {
        const token = get().adminToken;
        return token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } : {
          'Content-Type': 'application/json'
        };
      },

      // Admin API Calls
      createRaffle: async (raffleData) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/raffles`, {
            method: 'POST',
            headers: get().getAuthHeaders(),
            body: JSON.stringify(raffleData)
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create raffle');
          }

          return await response.json();
        } catch (error) {
          console.error('Error creating raffle:', error);
          throw error;
        }
      },

      updateRaffle: async (raffleId, raffleData) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/raffles/${raffleId}`, {
            method: 'PUT',
            headers: get().getAuthHeaders(),
            body: JSON.stringify(raffleData)
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update raffle');
          }

          return await response.json();
        } catch (error) {
          console.error('Error updating raffle:', error);
          throw error;
        }
      },

      // Utility function to check if user is admin
      checkIsAdmin: () => get().isAdmin,

      // Getters
      getPromotedTokens: () => {
        const state = get();
        return state.tokens.filter((token) => token.isPromoted);
      },
    }),
    {
      name: 'admin-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAdminStore;
