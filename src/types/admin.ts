import { AdminUser, AuditLog, SystemMetrics, AdminSettings, UserActivity, SecurityEvent } from '@prisma/client';

// Single Admin User Types
export type AdminUserWithAuditLogs = AdminUser & {
  auditLogs: AuditLog[];
};

export interface AdminCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AdminAuthContext {
  adminUser: AdminUser | null;
  isLoading: boolean;
  login: (credentials: AdminCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasFullAccess: () => boolean; // Always returns true for the single admin
}

// Audit Log Types
export interface CreateAuditLogData {
  adminId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
}

export interface AuditLogFilters {
  adminId?: string;
  action?: string;
  resource?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

// System Metrics Types
export interface SystemMetricsData {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeUsers: number;
  apiRequests: number;
  errorRate: number;
  responseTime: number;
  dbConnections: number;
  queueSize: number;
}

export interface MetricsFilters {
  dateFrom?: Date;
  dateTo?: Date;
  interval?: 'hour' | 'day' | 'week' | 'month';
}

// Admin API Response Types
export interface AdminApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// Admin Settings Types
export interface AdminSettingsData {
  key: string;
  value: unknown;
  description?: string;
  category?: string;
  isSystemSetting?: boolean;
}

export interface AdminSettingsFilters {
  category?: string;
  isSystemSetting?: boolean;
  search?: string;
}

// User Activity Types
export interface UserActivityData {
  userId: string;
  action: string;
  resource?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
}

export interface UserActivityFilters {
  userId?: string;
  action?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

// Security Event Types
export interface SecurityEventData {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

export interface SecurityEventFilters {
  type?: string;
  severity?: string;
  resolved?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

// Single Admin Model - No roles or permissions needed
// The single admin has unrestricted access to everything

export type { AdminUser, AuditLog, SystemMetrics, AdminSettings, UserActivity, SecurityEvent };