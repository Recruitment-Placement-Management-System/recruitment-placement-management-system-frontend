import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../../store/auth.store';

function getDashboardPath(roles: string[]): string | null {
  if (roles.includes('admin')) return '/admin/dashboard';
  if (roles.includes('recruiter')) return '/recruiter/dashboard';
  if (roles.includes('candidate')) return '/candidate/dashboard';
  return null;
}

export default function GuestRoute() {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (isInitializing) return null;

  const dashboardPath = isAuthenticated && user ? getDashboardPath(user.roles) : null;
  return dashboardPath ? <Navigate to={dashboardPath} replace /> : <Outlet />;
}
