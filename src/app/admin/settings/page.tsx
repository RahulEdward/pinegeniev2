import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminUser } from '@/lib/admin-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  Mail, 
  CreditCard, 
  Users, 
  Database,
  ChevronRight
} from 'lucide-react';

// Force dynamic rendering for this page since it uses server-side features (cookies)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminSettingsPage() {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    redirect('/admin/login');
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Settings' },
  ];

  const settingsCategories = [
    {
      title: 'Appearance',
      description: 'Customize the look and feel of the admin dashboard',
      icon: Palette,
      href: '/admin/settings/theme',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    },
    {
      title: 'General',
      description: 'Configure basic system settings and preferences',
      icon: Globe,
      href: '/admin/settings/general',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    },
    {
      title: 'Notifications',
      description: 'Manage notification preferences and channels',
      icon: Bell,
      href: '/admin/settings/notifications',
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    },
    {
      title: 'Security',
      description: 'Configure security settings and access controls',
      icon: Shield,
      href: '/admin/settings/security',
      color: 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    },
    {
      title: 'Email',
      description: 'Configure email settings and templates',
      icon: Mail,
      href: '/admin/settings/email',
      color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    },
    {
      title: 'Billing',
      description: 'Manage payment gateways and billing settings',
      icon: CreditCard,
      href: '/admin/settings/billing',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    },
    {
      title: 'Users',
      description: 'Configure user registration and account settings',
      icon: Users,
      href: '/admin/settings/users',
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    },
    {
      title: 'Database',
      description: 'Manage database settings and backups',
      icon: Database,
      href: '/admin/settings/database',
      color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
    },
  ];

  return (
    <AdminLayout 
      title="Settings" 
      breadcrumbs={breadcrumbs}
      adminUser={adminUser}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category) => (
          <Link
            key={category.title}
            href={category.href}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6 flex items-start space-x-4 border border-gray-100 dark:border-gray-700"
          >
            <div className={`p-3 rounded-lg ${category.color}`}>
              <category.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{category.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{category.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}