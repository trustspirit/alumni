import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-byuh-crimson border-t-transparent" />
      </div>
    );
  }

  if (!hasRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
