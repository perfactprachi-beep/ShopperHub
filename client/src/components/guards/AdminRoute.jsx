import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function AdminRoute({ children }) {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
