import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useAuthStore } from '../../store/authStore.js';
import Spinner from '../ui/Spinner.jsx';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  const hydrated = useAuthStore((s) => s._hydrated);
  const location = useLocation();

  // Show spinner while auth state is being restored from localStorage
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
}
