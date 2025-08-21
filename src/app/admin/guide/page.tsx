'use client';

import AdminRoute from '@/components/admin/AdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminUserGuide from '@/components/admin/AdminUserGuide';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminGuidePage() {
  const { adminUser } = useAdminAuth();

  return (
    <AdminRoute>
      <AdminLayout 
        title="User Guide"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'User Guide' }
        ]}
        adminUser={{
          name: adminUser?.name || '',
          email: adminUser?.email || '',
          isAdmin: adminUser?.isAdmin || false,
        }}
      >
        <AdminUserGuide />
      </AdminLayout>
    </AdminRoute>
  );
}