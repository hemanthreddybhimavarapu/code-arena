import axios from 'axios';

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // On production public web host, always target live cloud backend URL directly
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://code-arena-backend-pjh9.onrender.com/api';
    }
  }

  if (import.meta.env.VITE_API_URL) {
    let clean = import.meta.env.VITE_API_URL.trim();
    if (!clean.endsWith('/api')) {
      clean = clean.replace(/\/+$/, '') + '/api';
    }
    return clean;
  }

  const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('custom_backend_url') : null;
  if (storedUrl && storedUrl.trim()) {
    let clean = storedUrl.trim();
    if (!clean.endsWith('/api')) {
      clean = clean.replace(/\/+$/, '') + '/api';
    }
    return clean;
  }

  return 'http://localhost:9090/api';
};

export const getBackendOrigin = () => {
  const baseUrl = getApiBaseUrl();
  return baseUrl.replace(/\/api\/?$/, '');
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
});

api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
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
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      const publicPaths = ['/', '/login', '/register', '/problems', '/leaderboard'];
      const isPublicRoute = publicPaths.some(path => window.location.pathname === path || window.location.pathname.startsWith('/problems/'));
      if (!isPublicRoute) {
        window.location.href = '/login';
      }
    }
    const responseData = error.response?.data;
    let message = 'Something went wrong';
    if (typeof responseData === 'string' && responseData.trim()) {
      message = responseData;
    } else if (responseData?.message) {
      message = responseData.message;
    } else if (!error.response || error.code === 'ERR_NETWORK') {
      message = 'Unable to connect to backend server. Please try again.';
    }
    return Promise.reject({ ...error, message, isNetworkError: !error.response || error.code === 'ERR_NETWORK' });
  }
);

export default api;
