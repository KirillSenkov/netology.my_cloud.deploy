
import axios from 'axios';

function getCSRFToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

export async function ensureCsrf(): Promise<void> {
  await api.get('/auth/csrf/');
}

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// CSRF substitution for POST/PATCH/DELETE
api.interceptors.request.use((config) => {
  const token = getCSRFToken();
  const method = (config.method ?? 'get').toLowerCase();

  if (token && config.method && ['post', 'patch', 'delete'].includes(method)) {
    config.headers = config.headers ?? {};
    config.headers['X-CSRFToken'] = token;
  }

  return config;
});
