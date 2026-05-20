import { Navigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

export default function AuthGuard({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
