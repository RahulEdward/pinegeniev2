import { AdminUser } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Check if admin user has full access (always true for single admin)
 */
export function hasFullAccess(adminUser: AdminUser): boolean {
  return adminUser.isAdmin && adminUser.isActive;
}

/**
 * Single admin model - no permission checks needed
 * Admin has unrestricted access to everything
 */
export function hasPermission(adminUser: AdminUser, _permission?: string): boolean {
  return hasFullAccess(adminUser);
}

/**
 * Single admin model - no role checks needed
 * Admin has complete access
 */
export function hasRole(adminUser: AdminUser, _role?: string): boolean {
  return hasFullAccess(adminUser);
}

/**
 * Hash a password for admin users
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

/**
 * Validate admin user data for single admin model
 */
export function validateAdminUser(data: {
  email: string;
  name: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Name validation
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format admin user display name
 */
export function formatAdminDisplayName(adminUser: AdminUser): string {
  return `${adminUser.name} (System Administrator)`;
}

/**
 * Check if admin account is locked
 */
export function isAccountLocked(adminUser: AdminUser): boolean {
  if (!adminUser.lockedUntil) return false;
  return new Date() < adminUser.lockedUntil;
}

/**
 * Get time until account unlock
 */
export function getTimeUntilUnlock(adminUser: AdminUser): number | null {
  if (!adminUser.lockedUntil) return null;
  const now = new Date().getTime();
  const unlockTime = adminUser.lockedUntil.getTime();
  return Math.max(0, unlockTime - now);
}

/**
 * Format admin status for display
 */
export function formatAdminStatus(adminUser: AdminUser): string {
  if (!adminUser.isActive) return 'Inactive';
  if (isAccountLocked(adminUser)) return 'Locked';
  return 'Active';
}

/**
 * Get admin capabilities (always full access for single admin)
 */
export function getAdminCapabilities(adminUser: AdminUser): string[] {
  if (!hasFullAccess(adminUser)) return [];
  
  return [
    'User Management',
    'System Configuration',
    'Security & Audit',
    'Analytics & Reporting',
    'Content Moderation',
    'Billing Management',
    'LLM Management',
    'Data Management',
    'Backup & Recovery'
  ];
}