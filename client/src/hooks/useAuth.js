import { useAuthStore } from '../store/authStore.js';

export function useAuth() {
  const { user, accessToken, login, logout, setToken } = useAuthStore();
  return {
    user,
    accessToken,
    isLoggedIn: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    setToken,
  };
}
