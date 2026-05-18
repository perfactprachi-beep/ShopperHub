import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

const AUTH_SKIP = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken;
  const url = config.url || '';
  const isAuthEndpoint = AUTH_SKIP.some(path => url.includes(path));

  console.log('[axios] Request to:', url, 'Token present:', !!token, 'Auth endpoint:', isAuthEndpoint);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }

  if (!isAuthEndpoint) {
    if (!refreshing) {
      refreshing = api.post('/auth/refresh').finally(() => { refreshing = null; });
    }
    try {
      const { data } = await refreshing;
      useAuthStore.getState().setToken(data.accessToken);
      config.headers.Authorization = `Bearer ${data.accessToken}`;
      console.log('[axios] Refreshed token before request');
    } catch (refreshError) {
      console.log('[axios] Token refresh before request failed');
    }
  }

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
    
    console.log('[axios] Error status:', error.response?.status, 'URL:', url);
    
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      console.log('[axios] Attempting token refresh...');
      
      if (!refreshing) {
        refreshing = api.post('/auth/refresh').finally(() => { refreshing = null; });
      }
      try {
        const { data } = await refreshing;
        useAuthStore.getState().setToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        console.log('[axios] Token refreshed successfully');
        return api(original);
      } catch {
        console.log('[axios] Token refresh failed, logging out');
        useAuthStore.getState().logout();
        const isAdmin = window.location.pathname.startsWith('/admin');
        window.location.href = isAdmin ? '/admin/login' : '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
