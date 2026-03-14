import { apiRequest, apiRequestBlob, apiUpload } from '@/services/api';

const profileService = {
  getProfile() {
    return apiRequest('/users/profile', { auth: true, authType: 'user' });
  },

  updateProfile(payload) {
    return apiRequest('/users/profile', {
      method: 'PUT',
      auth: true,
      authType: 'user',
      body: payload,
    });
  },

  /**
    * Upload a PDF File object to the backend.
   * @param {File} file
   */
  uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);
    return apiUpload('/users/resume', formData, 'user');
  },

  getResumeBlob() {
    return apiRequestBlob('/users/resume/view', { auth: true, authType: 'user' });
  },
};

export default profileService;
