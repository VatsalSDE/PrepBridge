import { apiRequest } from '@/services/api';

const reportService = {
  getDashboard() {
    return apiRequest('/reports/dashboard', { auth: true, authType: 'user' });
  },

  getWeeklyReport() {
    return apiRequest('/reports/weekly', { auth: true, authType: 'user' });
  },

  getReportHistory(limit = 12) {
    return apiRequest(`/reports/history?limit=${limit}`, { auth: true, authType: 'user' });
  },

  getStats(days = 30) {
    return apiRequest(`/reports/stats?days=${days}`, { auth: true, authType: 'user' });
  },

  getReflections(type, limit = 30) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (type) params.set('type', type);
    return apiRequest(`/reports/reflections?${params.toString()}`, { auth: true, authType: 'user' });
  },

  submitReflection(payload) {
    return apiRequest('/reports/reflection', {
      method: 'POST',
      auth: true,
      authType: 'user',
      body: payload,
    });
  },
};

export default reportService;
