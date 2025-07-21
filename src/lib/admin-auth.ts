import { AdminUserService } from '@/services/admin';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean; // Always true - single admin model
  lastLogin?: Date;
  lastLoginIP?: string;
  sessionId?: string;
  isActive: boolean;
  mfaEnabled: boolean;
}

export interface AdminCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AdminSession {
  adminId: string;
  email: string;
  sessionId: string;
  expiresAt: Date;
}

/**
 * Get the single admin user from session
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;

    if (!token) {
      return null;
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as { adminId: string; sessionId: string };
    
    // Get admin user from database
    const adminUser = await AdminUserService.findById(decoded.adminId);

    if (!adminUser || !adminUser.isActive || !adminUser.isAdmin) {
      return null;
    }

    // Check if session is still valid
    if (adminUser.sessionId !== decoded.sessionId) {
      return null;
    }

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      isAdmin: adminUser.isAdmin,
      lastLogin: adminUser.lastLogin || undefined,
      lastLoginIP: adminUser.lastLoginIP || undefined,
      sessionId: adminUser.sessionId || undefined,
      isActive: adminUser.isActive,
      mfaEnabled: adminUser.mfaEnabled,
    };
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
}

/**
 * Authenticate admin with credentials (delegated to service)
 */
export async function authenticateAdmin(credentials: AdminCredentials): Promise<AdminUser | null> {
  // Use the service function
  const { authenticateAdmin: serviceAuth } = await import('@/services/admin');
  const adminUser = await serviceAuth(credentials);

  if (!adminUser) {
    return null;
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    name: adminUser.name,
    isAdmin: adminUser.isAdmin,
    lastLogin: adminUser.lastLogin || undefined,
    lastLoginIP: adminUser.lastLoginIP || undefined,
    sessionId: adminUser.sessionId || undefined,
    isActive: adminUser.isActive,
    mfaEnabled: adminUser.mfaEnabled,
  };
}

/**
 * Require admin authentication - throws if not authenticated
 */
export async function requireAdmin(): Promise<AdminUser> {
  const adminUser = await getAdminUser();
  
  if (!adminUser) {
    throw new Error('Admin authentication required');
  }

  return adminUser;
}

/**
 * Check if user has full admin access (always true for single admin)
 */
export function hasFullAccess(adminUser: AdminUser): boolean {
  return adminUser.isAdmin && adminUser.isActive;
}



/**
 * Update admin login IP address
 */
export async function updateAdminLoginIP(adminId: string, ipAddress: string): Promise<void> {
  await AdminUserService.update(adminId, { lastLoginIP: ipAddress });
}

/**
 * Logout admin by clearing session
 */
export async function logoutAdmin(adminId: string): Promise<void> {
  await AdminUserService.update(adminId, { sessionId: null });
}