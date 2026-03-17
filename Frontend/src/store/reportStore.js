import { create } from 'zustand';
import reportService from '@/services/reportService';

const useReportStore = create((set, get) => ({
  dashboard: null,
  weeklyReport: null,
  reportHistory: [],
  stats: null,
  reflections: [],
  isLoading: false,
  isRefreshing: false,
  isSubmitting: false,
  error: null,

  fetchReportsDashboard: async ({ silent = false } = {}) => {
    set(silent ? { isRefreshing: true, error: null } : { isLoading: true, error: null });
    try {
      const dashboardRes = await reportService.getDashboard();
      const payload = dashboardRes?.data || null;

      set({
        dashboard: payload,
        weeklyReport: payload?.weeklyReport || null,
        reportHistory: payload?.reportHistory || [],
        stats: payload?.stats || null,
        reflections: payload?.pastReflections || [],
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (error) {
      set({ isLoading: false, isRefreshing: false, error: error.message || 'Failed to load reports' });
      throw error;
    }
  },

  submitReflection: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await reportService.submitReflection(payload);
      const saved = response?.data;
      set((state) => ({
        reflections: saved
          ? [saved, ...state.reflections.filter((item) => item._id !== saved._id)]
          : state.reflections,
        isSubmitting: false,
        error: null,
      }));

      await get().fetchReportsDashboard({ silent: true });
      return saved;
    } catch (error) {
      set({ isSubmitting: false, error: error.message || 'Failed to submit reflection' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useReportStore;
