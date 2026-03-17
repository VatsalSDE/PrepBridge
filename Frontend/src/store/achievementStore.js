import { create } from 'zustand';
import achievementService from '@/services/achievementService';

const useAchievementStore = create((set) => ({
  allBadges: [],
  earned: [],
  inProgress: [],
  totalEarned: 0,
  totalBadges: 0,

  streaks: null,
  leaderboard: [],
  userRank: null,
  userStats: null,

  isLoading: false,
  error: null,

  fetchAchievements: async ({ silent = false } = {}) => {
    if (!silent) set({ isLoading: true, error: null });
    try {
      const [badgesRes, streaksRes] = await Promise.all([
        achievementService.getBadges(),
        achievementService.getStreaks(),
      ]);
      const badgeData = badgesRes?.data || {};
      const earnedList = badgeData.earned || [];
      const inProgressList = badgeData.inProgress || [];
      set({
        earned: earnedList,
        inProgress: inProgressList,
        totalEarned: badgeData.totalEarned ?? earnedList.length,
        totalBadges: badgeData.totalBadges ?? (earnedList.length + inProgressList.length),
        allBadges: [...earnedList, ...inProgressList],
        streaks: streaksRes?.data || null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({ isLoading: false, error: error.message || 'Failed to fetch achievements' });
      throw error;
    }
  },

  fetchLeaderboard: async () => {
    try {
      const res = await achievementService.getLeaderboard();
      const data = res?.data || {};
      set({
        leaderboard: data.leaderboard || [],
        userRank: data.userRank ?? null,
        userStats: data.userStats ?? null,
      });
    } catch {
      // leaderboard is non-critical, don't update error state
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAchievementStore;
