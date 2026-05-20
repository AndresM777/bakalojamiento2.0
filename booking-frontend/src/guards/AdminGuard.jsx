import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

export default function AdminGuard({ children }) {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
