'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, X } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'icon' | 'button';
  className?: string;
  showText?: boolean;
}

export default function LogoutButton({ 
  variant = 'button', 
  className = '',
  showText = true 
}: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  const confirmLogout = () => {
    setShowConfirm(true);
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={confirmLogout}
          disabled={isLoggingOut}
          className={`p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 ${className}`}
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm Logout
                </h3>
                <button
                  onClick={cancelLogout}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to logout from the admin dashboard?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
                <button
                  onClick={cancelLogout}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={confirmLogout}
        disabled={isLoggingOut}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 ${className}`}
        title="Logout"
      >
        <LogOut className="w-4 h-4" />
        {showText && <span className="hidden sm:inline">Logout</span>}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Logout
              </h3>
              <button
                onClick={cancelLogout}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to logout from the admin dashboard?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
              <button
                onClick={cancelLogout}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}