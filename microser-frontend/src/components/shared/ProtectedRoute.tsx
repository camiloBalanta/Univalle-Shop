import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { UserRole } from '../../types/domain';

type ProtectedRouteProps = {
  roles?: UserRole[];
};

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const session = useAuthStore((state) => state.session);

  if (!session) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(session.rol)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
