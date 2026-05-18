import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function AdminBlockedRoute({ children }) {
  const { isAdmin } = useAuth();
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
}
