'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireFullAccess?: boolean;
}

/**
 * Client-side admin route protection component
 * Ensures only authenticated admin users can access protected content
 */
export default function AdminRoute({ 
  children, 
  fallback,
  requireFullAccess = true 
}: AdminRouteProps) {
  const { adminUser, isLoading, isAuthenticated, hasFullAccess } = useAdminAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to admin login
        router.push('/admin/login');
        return;
      }

      if (requireFullAccess && !hasFullAccess()) {
        // Admin doesn't have required access (shouldn't happen in single admin model)
        router.push('/admin/login');
        return;
      }

      setShouldRender(true);
    }
  }, [isLoading, isAuthenticated, hasFullAccess, requireFullAccess, router]);

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying admin access...</p>
          </div>
        </div>
      )
    );
  }

  // Don't render if not authenticated or doesn't have access
  if (!shouldRender || !isAuthenticated || (requireFullAccess && !hasFullAccess())) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for admin route protection
 */
export function withAdminRoute<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    requireFullAccess?: boolean;
  }
) {
  return function AdminProtectedComponent(props: P) {
    return (
      <AdminRoute 
        fallback={options?.fallback}
        requireFullAccess={options?.requireFullAccess}
      >
        <Component {...props} />
      </AdminRoute>
    );
  };
}

/**
 * Hook for checking admin permissions in components
 */
export function useAdminPermissions() {
  const { adminUser, isAuthenticated, hasFullAccess } = useAdminAuth();

  return {
    isAdmin: isAuthenticated && adminUser?.isAdmin,
    hasFullAccess: hasFullAccess(),
    canAccessResource: (resource: string) => hasFullAccess(), // Single admin has access to all
    canPerformAction: (action: string) => hasFullAccess(), // Single admin can perform all actions
    adminUser,
  };
}