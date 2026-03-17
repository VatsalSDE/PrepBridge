import { apiRequest } from '@/services/api';

const calendarService = {
  getHeatmap() {
    return apiRequest('/calendar/heatmap', { auth: true, authType: 'user' });
  },

  getDayDetails(date) {
    return apiRequest(`/calendar/day/${encodeURIComponent(date)}`, { auth: true, authType: 'user' });
  },
};

export default calendarService;
