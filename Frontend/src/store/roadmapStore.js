import { create } from 'zustand';
import roadmapService from '@/services/roadmapService';

const useRoadmapStore = create((set, get) => ({
  roadmap: null,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchRoadmap: async ({ silent = false } = {}) => {
    if (!silent) {
      set({ isLoading: true, error: null });
    }
    try {
      const response = await roadmapService.getRoadmap();
      set({ roadmap: response?.data || null, isLoading: false, error: null });
      return response?.data || null;
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to fetch roadmap' });
      throw error;
    }
  },

  toggleFoundationTopic: async (section, sectionName, topicName) => {
    set({ isMutating: true, error: null });
    try {
      await roadmapService.toggleFoundation(section, sectionName, topicName);
      await get().fetchRoadmap({ silent: true });
      set({ isMutating: false, error: null });
    } catch (error) {
      set({ isMutating: false, error: error.message || 'Failed to update roadmap topic' });
      throw error;
    }
  },

  toggleDomainSkill: async (roleId, skillName) => {
    set({ isMutating: true, error: null });
    try {
      await roadmapService.toggleDomain(roleId, skillName);
      await get().fetchRoadmap({ silent: true });
      set({ isMutating: false, error: null });
    } catch (error) {
      set({ isMutating: false, error: error.message || 'Failed to update domain skill' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useRoadmapStore;