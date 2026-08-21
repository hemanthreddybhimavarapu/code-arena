import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
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
    // Return standard error messages from spring responses or connection error message
    const message = error.response?.data?.message || (!error.response ? 'Unable to connect to backend server (localhost:8080)' : 'Something went wrong');
    return Promise.reject({ ...error, message });
  }
);

export default api;
