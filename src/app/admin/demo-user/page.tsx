'use client';

import { useState } from 'react';
import AdminRoute from '@/components/admin/AdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { User, Calendar, Coins, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExtendResult {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  subscription?: {
    id: string;
    expiresAt: string;
  };
  error?: string;
  details?: string;
}

export default function DemoUserPage() {
  const { adminUser } = useAdminAuth();
  const [isExtending, setIsExtending] = useState(false);
  const [result, setResult] = useState<ExtendResult | null>(null);

  const extendDemoUser = async () => {
    setIsExtending(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/extend-demo-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setResult(data);
        toast.success(data.message);
      } else {
        setResult({
          success: false,
          message: 'Failed to extend demo user',
          error: data.error || 'Unknown error',
          details: data.details
        });
        toast.error(data.error || 'Failed to extend demo user');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setResult({
        success: false,
        message: 'Failed to extend demo user',
        error: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setIsExtending(false);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout 
        title="Demo User Management"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Demo User Management' }
        ]}
        adminUser={{
          name: adminUser?.name || '',
          email: adminUser?.email || '',
          isAdmin: adminUser?.isAdmin || false,
        }}
      >
        <div className="space-y-6">
          {/* Demo User Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Demo User Management
              </h2>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Demo User Details
              </h3>
              <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <p><strong>Email:</strong> demo@pinegenie.com</p>
                <p><strong>Purpose:</strong> Testing and demonstration</p>
                <p><strong>Access:</strong> Full application features</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Extend Demo User Subscription
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This will extend the demo user's subscription by 6 months and allocate 100,000 tokens for testing.
                </p>
              </div>
              
              <button
                onClick={extendDemoUser}
                disabled={isExtending}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isExtending
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isExtending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Extending...
                  </div>
                ) : (
                  'Extend Demo User'
                )}
              </button>
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`rounded-lg shadow-sm border p-6 ${
              result.success
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                )}
                
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    result.success
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {result.success ? 'Success!' : 'Error'}
                  </h3>
                  
                  <p className={`mb-4 ${
                    result.success
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.message}
                  </p>

                  {result.success && result.user && result.subscription && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                        <div className="flex items-center mb-2">
                          <User className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                          <h4 className="font-medium text-gray-900 dark:text-white">User Info</h4>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p><strong>ID:</strong> {result.user.id}</p>
                          <p><strong>Email:</strong> {result.user.email}</p>
                          <p><strong>Name:</strong> {result.user.name}</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-700">
                        <div className="flex items-center mb-2">
                          <Calendar className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                          <h4 className="font-medium text-gray-900 dark:text-white">Subscription</h4>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p><strong>ID:</strong> {result.subscription.id}</p>
                          <p><strong>Expires:</strong> {new Date(result.subscription.expiresAt).toLocaleDateString()}</p>
                          <p><strong>Status:</strong> Active</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!result.success && result.error && (
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 mt-3">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Error:</strong> {result.error}
                      </p>
                      {result.details && (
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          <strong>Details:</strong> {result.details}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-start">
              <Coins className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  What This Does
                </h3>
                <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <li>• Creates demo@pinegenie.com user if it doesn't exist</li>
                  <li>• Extends subscription by 6 months from current date</li>
                  <li>• Allocates 100,000 tokens for testing</li>
                  <li>• Sets up Pro plan with unlimited features</li>
                  <li>• Enables full application access for testing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}