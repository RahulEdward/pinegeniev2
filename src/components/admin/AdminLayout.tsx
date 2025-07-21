'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  CreditCard, 
  Shield,
  Menu,
  X,
  Bot,
  ChevronRight
} from 'lucide-react';
import LogoutButton from './LogoutButton';
import EnhancedThemeToggle from './EnhancedThemeToggle';

const iconMap = {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  CreditCard,
  Shield,
  Bot,
};

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  adminUser?: {
    name: string;
    email: string;
    isAdmin: boolean;
  };
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    href: '/admin/users',
  },
  {
    id: 'models',
    label: 'AI Models',
    icon: Bot,
    href: '/admin/models',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/admin/analytics',
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    href: '/admin/billing',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    href: '/admin/security',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/admin/settings',
  },
];

export default function AdminLayout({ children, title, breadcrumbs, actions, adminUser }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-blue-600 font-bold text-lg">PG</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">PineGenie</h1>
              <p className="text-xs text-blue-100">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-blue-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 mr-4 transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200'
                  }`} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="w-1 h-6 bg-blue-600 rounded-full ml-2"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {adminUser?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {adminUser?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                System Administrator
              </p>
            </div>
            <LogoutButton variant="icon" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between h-16 px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <nav className="hidden md:flex items-center space-x-2">
                    {breadcrumbs.map((crumb, index) => (
                      <div key={index} className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                        {crumb.href ? (
                          <Link
                            href={crumb.href}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            {crumb.icon && (() => {
                              const IconComponent = iconMap[crumb.icon as keyof typeof iconMap];
                              return IconComponent ? <IconComponent className="w-4 h-4 inline mr-1" /> : null;
                            })()}
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {crumb.icon && (() => {
                              const IconComponent = iconMap[crumb.icon as keyof typeof iconMap];
                              return IconComponent ? <IconComponent className="w-4 h-4 inline mr-1" /> : null;
                            })()}
                            {crumb.label}
                          </span>
                        )}
                      </div>
                    ))}
                  </nav>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {actions}
              <EnhancedThemeToggle variant="compact" />
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Enhanced Page Content */}
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <div className="space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}