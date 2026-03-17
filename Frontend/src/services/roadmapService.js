import { apiRequest } from '@/services/api';

const roadmapService = {
  getRoadmap() {
    return apiRequest('/roadmap', { auth: true, authType: 'user' });
  },

  toggleFoundation(section, sectionName, topicName) {
    return apiRequest(`/roadmap/foundations/${section}`, {
      method: 'PATCH',
      auth: true,
      authType: 'user',
      body: { sectionName, topicName },
    });
  },

  toggleDomain(roleId, skillName) {
    return apiRequest(`/roadmap/domains/${roleId}`, {
      method: 'PATCH',
      auth: true,
      authType: 'user',
      body: { skillName },
    });
  },
};

export default roadmapService;