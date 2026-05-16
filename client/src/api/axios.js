import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const AUTH_SKIP = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const url = original?.url || '';

    // Never attempt token refresh for auth endpoints themselves
    const isAuthEndpoint = AUTH_SKIP.some(path => url.includes(path));
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      if (!refreshing) {
        refreshing = api.post('/auth/refresh').finally(() => { refreshing = null; });
      }
      try {
        const { data } = await refreshing;
        useAuthStore.getState().setToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        // Redirect admins to admin login, regular users to /login
        const isAdmin = window.location.pathname.startsWith('/admin');
        window.location.href = isAdmin ? '/admin/login' : '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
