import { apiRequest } from './api';

const authService = {
  register(payload) {
    return apiRequest('/auth/register', { method: 'POST', body: payload });
  },

  verifyOtp(payload) {
    return apiRequest('/auth/verify-otp', { method: 'POST', body: payload });
  },

  resendOtp(email) {
    return apiRequest('/auth/resend-otp', { method: 'POST', body: { email } });
  },

  login(payload) {
    return apiRequest('/auth/login', { method: 'POST', body: payload });
  },

  getMe() {
    return apiRequest('/auth/me', { auth: true });
  },

  forgotPassword(email) {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  resetPassword(token, password) {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    });
  },

  logout() {
    return apiRequest('/auth/logout', { method: 'POST', auth: true });
  },
};

export default authService;
