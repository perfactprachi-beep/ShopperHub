import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useAuthStore } from '../../store/authStore.js';

export default function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();
  const hydrated = useAuthStore((s) => s._hydrated);
  const location = useLocation();

  // Wait for localStorage to finish rehydrating before making redirect decisions
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F3F4F6]">
        <div className="w-8 h-8 border-4 border-[#8B1A2F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
  if (!isAdmin)    return <Navigate to="/admin/login" replace />;
  return children;
}
