'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminUser, AdminCredentials } from '@/types/admin';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isLoading: boolean;
  login: (credentials: AdminCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasFullAccess: () => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/auth/me');
      if (response.ok) {
        const data = await response.json();
        setAdminUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: AdminCredentials) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setAdminUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdminUser(null);
    }
  };

  const isAuthenticated = !!adminUser;

  const hasFullAccess = () => {
    return adminUser?.isAdmin === true && adminUser?.isActive === true;
  };

  const value: AdminAuthContextType = {
    adminUser,
    isLoading,
    login,
    logout,
    isAuthenticated,
    hasFullAccess,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}