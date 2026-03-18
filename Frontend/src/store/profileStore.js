import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import profileService from '@/services/profileService';

const DEFAULT_PROFILE = {
  id: '',
  name: '',
  email: '',
  college: '',
  branch: '',
  year: 1,
  cgpa: 0,
  targetRole: '',
  skills: [],
  projects: [],
  codingProfiles: { leetcode: '', codolio: '', gfg: '' },
  weeklyStudyGoal: 25,
  dailyTaskGoal: 6,
  resumeUrl: '',
  streak: 0,
  longestStreak: 0,
  tasksCompleted: 0,
  avgProductivity: 0,
};

const useProfileStore = create(
  persist(
    (set, get) => ({
  profile: DEFAULT_PROFILE,
  isLoading: false,
  hasFetched: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileService.getProfile();
      const nextProfile = { ...DEFAULT_PROFILE, ...(response?.data || {}) };
      set({ profile: nextProfile, isLoading: false, hasFetched: true, error: null });
      return nextProfile;
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to fetch profile' });
      throw error;
    }
  },

  saveProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileService.updateProfile(updates);
      const nextProfile = { ...DEFAULT_PROFILE, ...(response?.data || {}) };
      set({ profile: nextProfile, isLoading: false, hasFetched: true, error: null });
      return nextProfile;
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to update profile' });
      throw error;
    }
  },

  uploadResume: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileService.uploadResume(file);
      const current = get().profile;
      const updated = {
        ...current,
        resumeUrl: response?.data?.resumeUrl || current.resumeUrl,
      };
      set({ profile: updated, isLoading: false, error: null });
      return updated.resumeUrl;
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to upload resume' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  // Called by taskStore after a task is toggled – keeps stat in sync without extra API call
  updateTasksCompleted: (delta) =>
    set((state) => ({
      profile: {
        ...state.profile,
        tasksCompleted: Math.max(0, (state.profile.tasksCompleted || 0) + delta),
      },
    })),
    }),
    {
      name: 'prepbridge-profile',
    }
  )
);

export default useProfileStore;
