'use client';

import { useAdminPermissions } from '@/components/admin/AdminRoute';
import { AdminResource, AdminAction } from '@/lib/admin-permissions';
import AdminLayout from '@/components/admin/AdminLayout';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function AdminProtectionTestPage() {
  const { 
    isAdmin, 
    hasFullAccess, 
    canAccessResource, 
    canPerformAction, 
    adminUser 
  } = useAdminPermissions();

  const testCases = [
    {
      name: 'User Management Access',
      test: () => canAccessResource(AdminResource.USERS),
      expected: true,
    },
    {
      name: 'System Settings Access',
      test: () => canAccessResource(AdminResource.SETTINGS),
      expected: true,
    },
    {
      name: 'Security Access',
      test: () => canAccessResource(AdminResource.SECURITY),
      expected: true,
    },
    {
      name: 'Create User Action',
      test: () => canPerformAction(AdminAction.CREATE),
      expected: true,
    },
    {
      name: 'Delete System Action',
      test: () => canPerformAction(AdminAction.DELETE),
      expected: true,
    },
    {
      name: 'Full Access Check',
      test: () => hasFullAccess,
      expected: true,
    },
  ];

  return (
    <AdminLayout
      title="Route Protection Test"
      adminUser={adminUser ? {
        name: adminUser.name,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin,
      } : undefined}
    >
      <div className="space-y-8">
        {/* Admin Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Admin Authentication Status
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              {isAdmin ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm">
                Admin Status: {isAdmin ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {hasFullAccess ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm">
                Full Access: {hasFullAccess ? 'Granted' : 'Denied'}
              </span>
            </div>
          </div>

          {adminUser && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Admin Details
              </h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>Name: {adminUser.name}</p>
                <p>Email: {adminUser.email}</p>
                <p>Admin: {adminUser.isAdmin ? 'Yes' : 'No'}</p>
                <p>Active: {adminUser.isActive ? 'Yes' : 'No'}</p>
                <p>MFA Enabled: {adminUser.mfaEnabled ? 'Yes' : 'No'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Permission Tests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Permission Tests
            </h2>
          </div>

          <div className="space-y-3">
            {testCases.map((testCase, index) => {
              const result = testCase.test();
              const passed = result === testCase.expected;

              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    passed 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {testCase.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Expected: {testCase.expected.toString()}, Got: {result.toString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Single Admin Model Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
            Single Admin Model
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <p>✅ No role-based permissions - single admin has complete access</p>
            <p>✅ No permission checks needed - authenticated admin can do everything</p>
            <p>✅ Simplified security model with comprehensive audit logging</p>
            <p>✅ Full platform control concentrated in one administrative account</p>
            <p>✅ Enhanced security through simplicity and focused access control</p>
          </div>
        </div>

        {/* Route Protection Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Route Protection Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Client-Side Protection
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• AdminRoute component wrapper</li>
                <li>• AdminAuthProvider context</li>
                <li>• Automatic redirect to login</li>
                <li>• Real-time auth state management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Server-Side Protection
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Next.js middleware protection</li>
                <li>• API route authentication</li>
                <li>• JWT token verification</li>
                <li>• Security event logging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}