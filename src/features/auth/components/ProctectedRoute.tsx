import { Navigate, Outlet } from 'react-router-dom';

import useAuthStore from '../../../store/auth.store';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isInitializing = useAuthStore(
    (state) => state.isInitializing
  );

  const user = useAuthStore((state) => state.user);

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    (!user || !user.roles.some((role) => allowedRoles.includes(role)))
  ) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;