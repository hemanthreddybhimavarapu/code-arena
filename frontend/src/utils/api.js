import axios from 'axios';

export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    let clean = import.meta.env.VITE_API_URL.trim();
    if (!clean.endsWith('/api')) {
      clean = clean.replace(/\/+$/, '') + '/api';
    }
    return clean;
  }
  const storedUrl = localStorage.getItem('custom_backend_url');
  if (storedUrl && storedUrl.trim()) {
    let clean = storedUrl.trim();
    if (!clean.endsWith('/api')) {
      clean = clean.replace(/\/+$/, '') + '/api';
    }
    return clean;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return 'http://localhost:9090/api';
};

export const getBackendOrigin = () => {
  const baseUrl = getApiBaseUrl();
  if (baseUrl === '/api' || baseUrl.startsWith('/')) {
    return typeof window !== 'undefined' ? window.location.origin : '';
  }
  return baseUrl.replace(/\/api\/?$/, '');
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const publicPaths = ['/', '/login', '/register', '/problems', '/leaderboard'];
      const isPublicRoute = publicPaths.some(path => window.location.pathname === path || window.location.pathname.startsWith('/problems/'));
      if (!isPublicRoute) {
        window.location.href = '/login';
      }
    }
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK';
    const message = error.response?.data?.message || (isNetworkError ? 'Unable to connect to backend server. Please verify backend is running.' : 'Something went wrong');
    return Promise.reject({ ...error, message, isNetworkError });
  }
);

export default api;
