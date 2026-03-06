import { apiRequest } from './api';

const adminService = {
  login(payload) {
    return apiRequest('/auth/admin/login', { method: 'POST', body: payload });
  },

  getDashboard() {
    return apiRequest('/admin/dashboard', { auth: true, authType: 'admin' });
  },

  getUsers(page = 1, limit = 20) {
    return apiRequest(`/admin/users?page=${page}&limit=${limit}`, { auth: true, authType: 'admin' });
  },

  banUser(userId) {
    return apiRequest(`/admin/users/${userId}/ban`, { method: 'PATCH', auth: true, authType: 'admin' });
  },

  unbanUser(userId) {
    return apiRequest(`/admin/users/${userId}/unban`, { method: 'PATCH', auth: true, authType: 'admin' });
  },
};

export default adminService;
