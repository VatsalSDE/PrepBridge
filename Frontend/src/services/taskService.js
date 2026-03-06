import { apiRequest } from './api';

const taskService = {
  getTodayTasks() {
    return apiRequest('/tasks', { auth: true });
  },

  getTasksByDate(date) {
    return apiRequest(`/tasks/date?date=${encodeURIComponent(date)}`, { auth: true });
  },

  createTask(payload) {
    return apiRequest('/tasks', { method: 'POST', auth: true, body: payload });
  },

  updateTask(taskId, payload) {
    return apiRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      auth: true,
      body: payload,
    });
  },

  toggleTask(taskId) {
    return apiRequest(`/tasks/${taskId}/toggle`, {
      method: 'PATCH',
      auth: true,
    });
  },

  deleteTask(taskId) {
    return apiRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};

export default taskService;
