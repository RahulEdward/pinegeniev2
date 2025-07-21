/**
 * Admin Permissions Library for Single Admin Model
 * Since we have a single admin with complete access, these functions always return true
 * but provide a consistent API for future extensibility
 */

import { AdminUser } from '@/types/admin';

/**
 * Resource types that admin can manage
 */
export enum AdminResource {
  USERS = 'users',
  MODELS = 'models',
  ANALYTICS = 'analytics',
  BILLING = 'billing',
  SECURITY = 'security',
  SETTINGS = 'settings',
  CONTENT = 'content',
  SYSTEM = 'system',
  AUDIT = 'audit',
  BACKUP = 'backup',
}

/**
 * Action types that admin can perform
 */
export enum AdminAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  CONFIGURE = 'configure',
  MONITOR = 'monitor',
  EXPORT = 'export',
  IMPORT = 'import',
  BACKUP = 'backup',
  RESTORE = 'restore',
}

/**
 * Check if admin has access to a specific resource
 * Always returns true for single admin model
 */
export function hasResourceAccess(
  adminUser: AdminUser | null,
  resource: AdminResource
): boolean {
  if (!adminUser || !adminUser.isAdmin || !adminUser.isActive) {
    return false;
  }
  
  // Single admin has access to all resources
  return true;
}

/**
 * Check if admin can perform a specific action on a resource
 * Always returns true for single admin model
 */
export function canPerformAction(
  adminUser: AdminUser | null,
  resource: AdminResource,
  action: AdminAction
): boolean {
  if (!adminUser || !adminUser.isAdmin || !adminUser.isActive) {
    return false;
  }
  
  // Single admin can perform all actions on all resources
  return true;
}

/**
 * Get all resources that admin has access to
 * Returns all resources for single admin model
 */
export function getAccessibleResources(adminUser: AdminUser | null): AdminResource[] {
  if (!adminUser || !adminUser.isAdmin || !adminUser.isActive) {
    return [];
  }
  
  // Single admin has access to all resources
  return Object.values(AdminResource);
}

/**
 * Get all actions that admin can perform on a resource
 * Returns all actions for single admin model
 */
export function getAllowedActions(
  adminUser: AdminUser | null,
  resource: AdminResource
): AdminAction[] {
  if (!adminUser || !adminUser.isAdmin || !adminUser.isActive) {
    return [];
  }
  
  // Single admin can perform all actions
  return Object.values(AdminAction);
}

/**
 * Check if admin has full system access
 * Always returns true for authenticated single admin
 */
export function hasFullSystemAccess(adminUser: AdminUser | null): boolean {
  return !!(adminUser && adminUser.isAdmin && adminUser.isActive);
}

/**
 * Check if admin can access sensitive operations
 * Always returns true for single admin model
 */
export function canAccessSensitiveOperations(adminUser: AdminUser | null): boolean {
  return hasFullSystemAccess(adminUser);
}

/**
 * Check if admin can modify system settings
 * Always returns true for single admin model
 */
export function canModifySystemSettings(adminUser: AdminUser | null): boolean {
  return hasFullSystemAccess(adminUser);
}

/**
 * Check if admin can view audit logs
 * Always returns true for single admin model
 */
export function canViewAuditLogs(adminUser: AdminUser | null): boolean {
  return hasFullSystemAccess(adminUser);
}

/**
 * Check if admin can manage other users
 * Always returns true for single admin model
 */
export function canManageUsers(adminUser: AdminUser | null): boolean {
  return hasFullSystemAccess(adminUser);
}

/**
 * Check if admin can access billing information
 * Always returns true for single admin model
 */
export function canAccessBilling(adminUser: AdminUser | null): boolean {
  return hasFullSystemAccess(adminUser);
}

/**
 * Check if admin can configure AI models
 * Always returns true for single admin model
 */
export function canConfigureModels(adminUser: AdminUser | null): boolean {
  return hasFullSystemAccess(adminUser);
}

/**
 * Check if admin can perform backup operations
 * Always returns true for single admin model
 */
export function canPerformBackup(adminUser: AdminUser | null): boolean {
  return hasFullSystemAccess(adminUser);
}

/**
 * Check if admin can access security settings
 * Always returns true for single admin model
 */
export function canAccessSecurity(adminUser: AdminUser | null): boolean {
  return hasFullSystemAccess(adminUser);
}

/**
 * Get admin capabilities summary
 */
export function getAdminCapabilities(adminUser: AdminUser | null): {
  hasFullAccess: boolean;
  resources: AdminResource[];
  actions: AdminAction[];
  capabilities: string[];
} {
  const hasFullAccess = hasFullSystemAccess(adminUser);
  
  if (!hasFullAccess) {
    return {
      hasFullAccess: false,
      resources: [],
      actions: [],
      capabilities: [],
    };
  }
  
  return {
    hasFullAccess: true,
    resources: Object.values(AdminResource),
    actions: Object.values(AdminAction),
    capabilities: [
      'Complete User Management',
      'System Configuration',
      'Security & Audit Access',
      'Analytics & Reporting',
      'Content Moderation',
      'Billing Management',
      'AI Model Configuration',
      'Data Management',
      'Backup & Recovery',
      'Emergency Override',
    ],
  };
}

/**
 * Validate admin permissions for API endpoints
 */
export function validateApiAccess(
  adminUser: AdminUser | null,
  resource: AdminResource,
  action: AdminAction
): { allowed: boolean; reason?: string } {
  if (!adminUser) {
    return { allowed: false, reason: 'No admin user provided' };
  }
  
  if (!adminUser.isAdmin) {
    return { allowed: false, reason: 'User is not an admin' };
  }
  
  if (!adminUser.isActive) {
    return { allowed: false, reason: 'Admin account is not active' };
  }
  
  // Single admin model - always allow if authenticated
  return { allowed: true };
}

/**
 * Create permission context for components
 */
export function createPermissionContext(adminUser: AdminUser | null) {
  return {
    hasResourceAccess: (resource: AdminResource) => hasResourceAccess(adminUser, resource),
    canPerformAction: (resource: AdminResource, action: AdminAction) => 
      canPerformAction(adminUser, resource, action),
    hasFullAccess: () => hasFullSystemAccess(adminUser),
    getCapabilities: () => getAdminCapabilities(adminUser),
    validateAccess: (resource: AdminResource, action: AdminAction) => 
      validateApiAccess(adminUser, resource, action),
  };
}