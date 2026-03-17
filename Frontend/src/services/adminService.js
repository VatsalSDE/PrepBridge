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

  getUserDetails(userId) {
    return apiRequest(`/admin/users/${userId}`, { auth: true, authType: 'admin' });
  },

  banUser(userId) {
    return apiRequest(`/admin/users/${userId}/ban`, { method: 'PATCH', auth: true, authType: 'admin' });
  },

  unbanUser(userId) {
    return apiRequest(`/admin/users/${userId}/unban`, { method: 'PATCH', auth: true, authType: 'admin' });
  },

  getCompanies() {
    return apiRequest('/admin/companies', { auth: true, authType: 'admin' });
  },

  createCompany(payload) {
    return apiRequest('/admin/companies', {
      method: 'POST',
      auth: true,
      authType: 'admin',
      body: payload,
    });
  },

  updateCompany(companyId, payload) {
    return apiRequest(`/admin/companies/${companyId}`, {
      method: 'PUT',
      auth: true,
      authType: 'admin',
      body: payload,
    });
  },

  deleteCompany(companyId) {
    return apiRequest(`/admin/companies/${companyId}`, {
      method: 'DELETE',
      auth: true,
      authType: 'admin',
    });
  },

  approveCompany(companyId) {
    return apiRequest(`/admin/companies/${companyId}/approve`, {
      method: 'PATCH',
      auth: true,
      authType: 'admin',
    });
  },

  generateGuidelines(companyId, rawAlumniInput) {
    return apiRequest(`/admin/companies/${companyId}/generate-guidelines`, {
      method: 'POST',
      auth: true,
      authType: 'admin',
      body: { rawAlumniInput },
    });
  },

  getCommunityReports() {
    return apiRequest('/admin/community/reports', { auth: true, authType: 'admin' });
  },

  getCommunityPosts(page = 1, limit = 20, search = '', onlyReported = false) {
    const searchParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search,
      onlyReported: String(Boolean(onlyReported)),
    });
    return apiRequest(`/admin/community/posts?${searchParams.toString()}`, { auth: true, authType: 'admin' });
  },

  deleteCommunityPost(postId) {
    return apiRequest(`/admin/community/posts/${postId}`, {
      method: 'DELETE',
      auth: true,
      authType: 'admin',
    });
  },

  hidePost(postId) {
    return apiRequest(`/admin/community/posts/${postId}/hide`, {
      method: 'PATCH',
      auth: true,
      authType: 'admin',
    });
  },

  unhidePost(postId) {
    return apiRequest(`/admin/community/posts/${postId}/unhide`, {
      method: 'PATCH',
      auth: true,
      authType: 'admin',
    });
  },

  resolveReport(reportId, actionTaken = 'hidden') {
    return apiRequest(`/admin/reports/${reportId}/resolve`, {
      method: 'PATCH',
      auth: true,
      authType: 'admin',
      body: { actionTaken },
    });
  },

  dismissReport(reportId) {
    return apiRequest(`/admin/reports/${reportId}/dismiss`, {
      method: 'PATCH',
      auth: true,
      authType: 'admin',
    });
  },

  getRoadmapUsers(page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
    return apiRequest(`/admin/roadmap/users?${params.toString()}`, { auth: true, authType: 'admin' });
  },

  getUserRoadmap(userId) {
    return apiRequest(`/admin/roadmap/users/${userId}`, { auth: true, authType: 'admin' });
  },

  updateUserRoadmapFoundation(userId, section, sectionName, topicName) {
    return apiRequest(`/admin/roadmap/users/${userId}/foundations/${section}`, {
      method: 'PATCH',
      auth: true,
      authType: 'admin',
      body: { sectionName, topicName },
    });
  },

  updateUserRoadmapDomain(userId, roleId, skillName) {
    return apiRequest(`/admin/roadmap/users/${userId}/domains/${roleId}`, {
      method: 'PATCH',
      auth: true,
      authType: 'admin',
      body: { skillName },
    });
  },

  getRoadmapTemplate() {
    return apiRequest('/admin/roadmap/template', { auth: true, authType: 'admin' });
  },

  updateRoadmapTemplateFoundation(section, payload) {
    return apiRequest(`/admin/roadmap/template/foundations/${section}`, {
      method: 'PATCH',
      auth: true,
      authType: 'admin',
      body: payload,
    });
  },

  updateRoadmapTemplateDomains(roles) {
    return apiRequest('/admin/roadmap/template/domains', {
      method: 'PATCH',
      auth: true,
      authType: 'admin',
      body: { roles },
    });
  },
};

export default adminService;
