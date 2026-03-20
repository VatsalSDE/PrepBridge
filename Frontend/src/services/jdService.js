import { apiRequest, apiUpload } from '@/services/api';

const jdService = {
  getCompanies({ search = '', city = '', industry = '', page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams({
      search,
      city,
      industry,
      page: String(page),
      limit: String(limit),
    });
    return apiRequest(`/jd/companies?${params.toString()}`, { auth: true, authType: 'user' });
  },

  // ✅ CHANGED: handles both FormData and JSON
  analyzeJD(payload, isFormData = false) {
    if (isFormData) {
      return apiUpload('/jd/analyze', payload, 'user');
    }
    return apiRequest('/jd/analyze', {
      method: 'POST',
      auth: true,
      authType: 'user',
      body: payload,
    });
  },

  getHistory({ savedOnly = false, page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({
      savedOnly: String(savedOnly),
      page: String(page),
      limit: String(limit),
    });
    return apiRequest(`/jd/history?${params.toString()}`, { auth: true, authType: 'user' });
  },

  getAnalysis(id) {
    return apiRequest(`/jd/${id}`, { auth: true, authType: 'user' });
  },

  toggleSave(id) {
    return apiRequest(`/jd/${id}/save`, {
      method: 'PATCH',
      auth: true,
      authType: 'user',
    });
  },

  deleteAnalysis(id) {
    return apiRequest(`/jd/${id}`, {
      method: 'DELETE',
      auth: true,
      authType: 'user',
    });
  },

  getSkillGaps() {
    return apiRequest('/jd/skill-gaps', { auth: true, authType: 'user' });
  },
};

export default jdService;