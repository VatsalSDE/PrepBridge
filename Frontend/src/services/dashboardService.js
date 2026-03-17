import { apiRequest } from '@/services/api';

const dashboardService = {
  getSummary() {
    return apiRequest('/users/dashboard', { auth: true, authType: 'user' });
  },
};

export default dashboardService;
