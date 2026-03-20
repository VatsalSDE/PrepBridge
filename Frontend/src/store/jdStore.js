import { create } from 'zustand';
import jdService from '@/services/jdService';

const useJDStore = create((set, get) => ({
  companies: [],
  analysisHistory: [],
  skillGaps: [],
  currentAnalysis: null,
  pagination: { page: 1, limit: 20, total: 0 },
  isLoading: false,
  isAnalyzing: false,
  error: null,

  fetchCompanies: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await jdService.getCompanies(params);
      set({ companies: response?.data || [], isLoading: false, error: null });
      return response?.data || [];
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to load companies' });
      throw error;
    }
  },

  fetchHistory: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await jdService.getHistory(params);
      set({
        analysisHistory: response?.data || [],
        pagination: response?.pagination || { page: 1, limit: 20, total: 0 },
        isLoading: false,
        error: null,
      });
      return response?.data || [];
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to load JD history' });
      throw error;
    }
  },

  fetchSkillGaps: async () => {
    try {
      const response = await jdService.getSkillGaps();
      set({ skillGaps: response?.data || [] });
      return response?.data || [];
    } catch {
      set({ skillGaps: [] });
      return [];
    }
  },

  // ✅ CHANGED: accepts isFormData flag
  analyzeJD: async (payload, isFormData = false) => {
    set({ isAnalyzing: true, error: null });
    try {
      const response = await jdService.analyzeJD(payload, isFormData);
      const analysis = response?.data || null;
      set((state) => ({
        currentAnalysis: analysis,
        analysisHistory: analysis
          ? [analysis, ...state.analysisHistory.filter((item) => item._id !== analysis._id)]
          : state.analysisHistory,
        isAnalyzing: false,
        error: null,
      }));
      return analysis;
    } catch (error) {
      set({ isAnalyzing: false, error: error.message || 'Failed to analyze JD' });
      throw error;
    }
  },

  loadAnalysis: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await jdService.getAnalysis(id);
      const analysis = response?.data || null;
      set({ currentAnalysis: analysis, isLoading: false, error: null });
      return analysis;
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to load analysis' });
      throw error;
    }
  },

  toggleSaveAnalysis: async (id) => {
    const current = get().analysisHistory;
    const target = current.find((item) => item._id === id) || (get().currentAnalysis?._id === id ? get().currentAnalysis : null);
    const nextValue = !(target?.isSaved);

    set((state) => ({
      analysisHistory: state.analysisHistory.map((item) =>
        item._id === id ? { ...item, isSaved: nextValue } : item
      ),
      currentAnalysis: state.currentAnalysis?._id === id
        ? { ...state.currentAnalysis, isSaved: nextValue }
        : state.currentAnalysis,
    }));

    try {
      const response = await jdService.toggleSave(id);
      const confirmed = Boolean(response?.data?.isSaved);
      set((state) => ({
        analysisHistory: state.analysisHistory.map((item) =>
          item._id === id ? { ...item, isSaved: confirmed } : item
        ),
        currentAnalysis: state.currentAnalysis?._id === id
          ? { ...state.currentAnalysis, isSaved: confirmed }
          : state.currentAnalysis,
      }));
      return confirmed;
    } catch (error) {
      set((state) => ({
        analysisHistory: state.analysisHistory.map((item) =>
          item._id === id ? { ...item, isSaved: !nextValue } : item
        ),
        currentAnalysis: state.currentAnalysis?._id === id
          ? { ...state.currentAnalysis, isSaved: !nextValue }
          : state.currentAnalysis,
      }));
      throw error;
    }
  },

  deleteAnalysis: async (id) => {
    await jdService.deleteAnalysis(id);
    set((state) => ({
      analysisHistory: state.analysisHistory.filter((item) => item._id !== id),
      currentAnalysis: state.currentAnalysis?._id === id ? null : state.currentAnalysis,
    }));
  },

  clearCurrentAnalysis: () => set({ currentAnalysis: null }),
}));

export default useJDStore;