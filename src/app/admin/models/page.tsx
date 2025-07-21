import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import ModelManagement from '@/components/admin/ModelManagement';

// Force dynamic rendering for this page since it uses server-side features (cookies)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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