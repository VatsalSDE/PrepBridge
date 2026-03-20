import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '@/services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: ({ user, token }) => {
        set({
          user: user || null,
          token: token || null,
          isAuthenticated: Boolean(token || user),
          isLoading: false,
          error: null,
        });
      },

      loginWithCredentials: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      registerUser: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(payload);
          set({ isLoading: false, error: null });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      verifyOtpAndLogin: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.verifyOtp({ email, otp });
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      resendOtp: async (email) => {
        return authService.resendOtp(email);
      },

      requestPasswordReset: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.forgotPassword(email);
          set({ isLoading: false, error: null });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      resetPasswordWithToken: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.resetPassword(token, password);
          set({ isLoading: false, error: null });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      fetchCurrentUser: async () => {
        const token = get().token;
        if (!token) return null;

        set({ isLoading: true, error: null });
        try {
          const response = await authService.getMe();
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return response.user;
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message,
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout().catch(() => null);
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        set({ user: { ...currentUser, ...updates } });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      clearError: () => {
        set({ error: null });
      },

      // ✅ NEW: OAuth token setter
setOAuthToken: ({ token, name, email }) => {
  set({
    token,
    user: { name, email, role: "student" },
    isAuthenticated: true,
    isLoading: false,
    error: null,
  });
},
    }),
    {
      name: 'prepbridge-auth',
    }
  )
);

export default useAuthStore;