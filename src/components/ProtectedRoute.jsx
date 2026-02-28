import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './ui/Spinner';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner full />;
  // AUTH BYPASS — milestone 4 (re-enable before production)
  // if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
