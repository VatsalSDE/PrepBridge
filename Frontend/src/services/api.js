const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const parsePersistedState = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state || null;
  } catch {
    return null;
  }
};

const getStoredToken = (authType = 'user') => {
  const authState = parsePersistedState('prepbridge-auth');
  const adminState = parsePersistedState('prepbridge-admin');

  if (authType === 'admin') {
    if (adminState?.adminToken) return adminState.adminToken;
    return null;
  }

  if (authState?.token) return authState.token;
  return null;
};

const buildHeaders = (includeAuth = false, customHeaders = {}, authType = 'user') => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (includeAuth) {
    const token = getStoredToken(authType);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const normalizeError = async (response) => {
  let message = 'Something went wrong';

  try {
    const payload = await response.json();
    message = payload?.message || payload?.error || message;
  } catch {
    if (response.status === 401) message = 'Unauthorized. Please login again.';
    if (response.status === 403) message = 'Forbidden. Access denied.';
  }

  const error = new Error(message);
  error.status = response.status;
  throw error;
};

export const apiRequest = async (path, options = {}) => {
  const {
    method = 'GET',
    body,
    auth = false,
    authType = 'user',
    headers = {},
  } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(auth, headers, authType),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    await normalizeError(response);
  }

  if (response.status === 204) return null;
  return response.json();
};

export { API_BASE_URL };
