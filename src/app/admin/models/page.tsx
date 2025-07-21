import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import ModelManagement from '@/components/admin/ModelManagement';

export default async function AdminModelsPage() {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    redirect('/login');
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'AI Models', icon: 'Bot' },
  ];

  return (
    <AdminLayout 
      title="AI Model Management" 
      breadcrumbs={breadcrumbs}
    >
      <ModelManagement />
    </AdminLayout>
  );
}