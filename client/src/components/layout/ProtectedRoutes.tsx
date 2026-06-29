import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-10 h-10 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function RoleRoute({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-10 h-10 border-4 border-[var(--color-primary-200)] border-t-[var(--color-primary-600)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboard if they don't have access
    const redirectPath = user?.role === 'admin' 
      ? '/admin' 
      : user?.role === 'technician' 
        ? '/technician/dashboard' 
        : '/dashboard';
        
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
