import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const useAdminStore = create(
  persist(
    (set, get) => ({
      whitelistedWallets: [
        "25NcM1z7dxbRZE9JptiBVec9XySd8MGCnxZKMvzDP5T5",  // Admin Wallet 1
        "F2NMjJX7xHfKWfgAEv9uATcgx2nabzDFkKtk8szoJASN",  // Admin Wallet 2
        "4qKmxCGme3oDMbn5EidEJ22cMx1EWAXHsVXPMctCiHwZ",  // Admin Wallet 3
      ],
      
      adminToken: null,
      isAdmin: false,

      // Admin Authentication
      login: async (password) => {
        try {
          const response = await axios.post(`${API_URL}/admin/login`, { password });
          const { token } = response.data;
          set({ adminToken: token, isAdmin: true });
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: () => {
        set({ adminToken: null, isAdmin: false });
      },

      // Check if wallet is whitelisted
      isWalletWhitelisted: (walletAddress) => {
        return get().whitelistedWallets.includes(walletAddress);
      },

      // Get auth headers for API calls
      getAuthHeaders: () => {
        const token = get().adminToken;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },

      // Raffle Management
      createRaffle: async (raffleData) => {
        try {
          const headers = get().getAuthHeaders();
          const response = await axios.post(`${API_URL}/raffles`, raffleData, { headers });
          return response.data;
        } catch (error) {
          console.error('Error creating raffle:', error);
          throw error;
        }
      },

      updateRaffle: async (raffleId, raffleData) => {
        try {
          const headers = get().getAuthHeaders();
          const response = await axios.put(`${API_URL}/raffles/${raffleId}`, raffleData, { headers });
          return response.data;
        } catch (error) {
          console.error('Error updating raffle:', error);
          throw error;
        }
      },

      deleteRaffle: async (raffleId) => {
        try {
          const headers = get().getAuthHeaders();
          const response = await axios.delete(`${API_URL}/raffles/${raffleId}`, { headers });
          return response.data;
        } catch (error) {
          console.error('Error deleting raffle:', error);
          throw error;
        }
      },

      fetchActiveRaffles: async () => {
        try {
          const response = await axios.get(`${API_URL}/raffles/active`);
          return response.data;
        } catch (error) {
          console.error('Error fetching active raffles:', error);
          throw error;
        }
      },

      // Check if user is admin
      checkIsAdmin: () => {
        const token = get().adminToken;
        const isWhitelisted = get().isWalletWhitelisted(window.solana?.publicKey?.toString());
        return Boolean(token && isWhitelisted);
      },
    }),
    {
      name: 'admin-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAdminStore;
