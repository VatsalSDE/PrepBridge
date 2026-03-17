import { apiRequest } from '@/services/api';

const achievementService = {
  getBadges() {
    return apiRequest('/achievements', { auth: true, authType: 'user' });
  },

  getStreaks() {
    return apiRequest('/achievements/streaks', { auth: true, authType: 'user' });
  },

  getLeaderboard() {
    return apiRequest('/achievements/leaderboard', { auth: true, authType: 'user' });
  },
};

export default achievementService;
