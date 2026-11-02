import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../../store/auth.store';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectTo?: string;
}

function ProtectedRoute({
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const user = useAuthStore((state) => state.user);

  const isInitializing = useAuthStore(
    (state) => state.isInitializing
  );

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (
    allowedRoles &&
    (!user ||
      !user.roles.some((role) =>
        allowedRoles.includes(role)
      ))
  ) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;