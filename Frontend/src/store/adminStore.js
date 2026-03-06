import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import adminService from '@/services/adminService';

const useAdminStore = create(
  persist(
    (set) => ({
      isAdmin: false,
      adminUser: null,
      adminToken: null,
      dashboardStats: null,
      isLoading: false,
      error: null,

      loginAdmin: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await adminService.login({ email, password });
          set({
            isAdmin: true,
            adminUser: response.user,
            adminToken: response.token,
            isLoading: false,
            error: null,
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      fetchDashboard: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminService.getDashboard();
          set({ dashboardStats: response.data, isLoading: false, error: null });
          return response.data;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      logoutAdmin: () => {
        set({ isAdmin: false, adminUser: null, adminToken: null, dashboardStats: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'prepbridge-admin',
    }
  )
);

export default useAdminStore;
