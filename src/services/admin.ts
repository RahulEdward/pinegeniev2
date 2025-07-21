import { AdminUser, AuditLog, SystemMetrics, AdminSettings, UserActivity, SecurityEvent } from '@prisma/client';
import { CreateAuditLogData, AuditLogFilters, SystemMetricsData, MetricsFilters, AdminSettingsData, UserActivityData, SecurityEventData } from '@/types/admin';
import { hashPassword } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

// Admin User Services
export class AdminUserService {
  /**
   * Find admin user by email
   */
  static async findByEmail(email: string): Promise<AdminUser | null> {
    return prisma.adminUser.findUnique({
      where: { email },
    });
  }

  /**
   * Find admin user by ID
   */
  static async findById(id: string): Promise<AdminUser | null> {
    return prisma.adminUser.findUnique({
      where: { id },
    });
  }

  /**
   * Create the single admin user (only if none exists)
   */
  static async create(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<AdminUser> {
    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findFirst({
      where: { isAdmin: true },
    });

    if (existingAdmin) {
      throw new Error('Admin account already exists. Only one admin is allowed.');
    }

    const passwordHash = await hashPassword(data.password);

    return prisma.adminUser.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        isAdmin: true, // Always true for single admin model
      },
    });
  }

  /**
   * Update the single admin user
   */
  static async update(
    id: string,
    data: Partial<{
      name: string;
      isActive: boolean;
      mfaEnabled: boolean;
      mfaSecret: string;
      lastLoginIP: string;
      sessionId: string;
    }>
  ): Promise<AdminUser> {
    return prisma.adminUser.update({
      where: { id },
      data,
    });
  }

  /**
   * Update admin password
   */
  static async updatePassword(id: string, newPassword: string): Promise<AdminUser> {
    const passwordHash = await hashPassword(newPassword);
    
    return prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /**
   * Update last login time
   */
  static async updateLastLogin(id: string): Promise<AdminUser> {
    return prisma.adminUser.update({
      where: { id },
      data: { 
        lastLogin: new Date(),
        loginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  /**
   * Increment login attempts and lock account if necessary
   */
  static async incrementLoginAttempts(id: string): Promise<AdminUser> {
    const admin = await prisma.adminUser.findUnique({ where: { id } });
    if (!admin) throw new Error('Admin user not found');

    const newAttempts = admin.loginAttempts + 1;
    const shouldLock = newAttempts >= 5;

    return prisma.adminUser.update({
      where: { id },
      data: {
        loginAttempts: newAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null, // 30 minutes
      },
    });
  }

  /**
   * Get the single admin user
   */
  static async getSingleAdmin(): Promise<AdminUser | null> {
    return prisma.adminUser.findFirst({
      where: { isAdmin: true },
    });
  }

  /**
   * Ensure single admin model integrity
   */
  static async ensureSingleAdmin(): Promise<void> {
    const adminCount = await prisma.adminUser.count({
      where: { isAdmin: true },
    });

    if (adminCount > 1) {
      throw new Error('SINGLE_ADMIN_VIOLATION: Multiple admin accounts detected');
    }
    if (adminCount === 0) {
      throw new Error('NO_ADMIN_ACCOUNT: No admin account exists');
    }
  }

  /**
   * Deactivate admin user (cannot delete the single admin)
   */
  static async deactivate(id: string): Promise<AdminUser> {
    // Prevent deactivating the single admin
    const admin = await prisma.adminUser.findUnique({ where: { id } });
    if (!admin || !admin.isAdmin) {
      throw new Error('Admin user not found');
    }

    // For single admin model, we might want to prevent deactivation
    // or require special confirmation
    throw new Error('Cannot deactivate the single admin account');
  }
}

// Audit Log Services
export class AuditLogService {
  /**
   * Create audit log entry
   */
  static async create(data: CreateAuditLogData): Promise<AuditLog> {
    return prisma.auditLog.create({
      data,
    });
  }

  /**
   * Get audit logs with filtering and pagination
   */
  static async findMany(filters: AuditLogFilters = {}): Promise<{
    logs: (AuditLog & { admin: AdminUser })[];
    total: number;
  }> {
    const {
      adminId,
      action,
      resource,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
    } = filters;

    const where = {
      ...(adminId && { adminId }),
      ...(action && { action: { contains: action, mode: 'insensitive' as const } }),
      ...(resource && { resource: { contains: resource, mode: 'insensitive' as const } }),
      ...(dateFrom || dateTo) && {
        timestamp: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo }),
        },
      },
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { admin: true },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  /**
   * Get audit logs for specific admin
   */
  static async findByAdminId(
    adminId: string,
    limit: number = 20
  ): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { adminId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  /**
   * Delete old audit logs (for cleanup)
   */
  static async deleteOldLogs(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

// System Metrics Services
export class SystemMetricsService {
  /**
   * Record system metrics
   */
  static async record(data: SystemMetricsData): Promise<SystemMetrics> {
    return prisma.systemMetrics.create({
      data,
    });
  }

  /**
   * Get latest system metrics
   */
  static async getLatest(): Promise<SystemMetrics | null> {
    return prisma.systemMetrics.findFirst({
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Get system metrics with filtering
   */
  static async findMany(filters: MetricsFilters = {}): Promise<SystemMetrics[]> {
    const { dateFrom, dateTo, interval } = filters;

    const where = {
      ...(dateFrom || dateTo) && {
        timestamp: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo }),
        },
      },
    };

    // For now, return all matching records
    // In the future, we could implement aggregation based on interval
    return prisma.systemMetrics.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: interval === 'hour' ? 24 : interval === 'day' ? 30 : 100,
    });
  }

  /**
   * Get average metrics for a time period
   */
  static async getAverages(
    dateFrom: Date,
    dateTo: Date
  ): Promise<{
    avgCpuUsage: number;
    avgMemoryUsage: number;
    avgDiskUsage: number;
    avgResponseTime: number;
    avgErrorRate: number;
  }> {
    const result = await prisma.systemMetrics.aggregate({
      where: {
        timestamp: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      _avg: {
        cpuUsage: true,
        memoryUsage: true,
        diskUsage: true,
        responseTime: true,
        errorRate: true,
      },
    });

    return {
      avgCpuUsage: result._avg.cpuUsage || 0,
      avgMemoryUsage: result._avg.memoryUsage || 0,
      avgDiskUsage: result._avg.diskUsage || 0,
      avgResponseTime: result._avg.responseTime || 0,
      avgErrorRate: result._avg.errorRate || 0,
    };
  }

  /**
   * Delete old metrics (for cleanup)
   */
  static async deleteOldMetrics(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.systemMetrics.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}

// Admin Settings Services
export class AdminSettingsService {
  /**
   * Get setting by key
   */
  static async get(key: string): Promise<AdminSettings | null> {
    return prisma.adminSettings.findUnique({
      where: { key },
    });
  }

  /**
   * Set or update setting
   */
  static async set(data: AdminSettingsData & { updatedBy: string }): Promise<AdminSettings> {
    return prisma.adminSettings.upsert({
      where: { key: data.key },
      update: {
        value: data.value,
        description: data.description,
        category: data.category,
        updatedBy: data.updatedBy,
      },
      create: data,
    });
  }

  /**
   * Get all settings by category
   */
  static async getByCategory(category: string): Promise<AdminSettings[]> {
    return prisma.adminSettings.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Delete setting
   */
  static async delete(key: string): Promise<void> {
    await prisma.adminSettings.delete({
      where: { key },
    });
  }
}

// User Activity Services
export class UserActivityService {
  /**
   * Log user activity
   */
  static async log(data: UserActivityData): Promise<UserActivity> {
    return prisma.userActivity.create({
      data,
    });
  }

  /**
   * Get user activities with filtering
   */
  static async findMany(filters: {
    userId?: string;
    action?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ activities: (UserActivity & { user: { name: string | null; email: string | null } })[]; total: number }> {
    const { userId, action, dateFrom, dateTo, limit = 50, offset = 0 } = filters;

    const where = {
      ...(userId && { userId }),
      ...(action && { action: { contains: action, mode: 'insensitive' as const } }),
      ...(dateFrom || dateTo) && {
        timestamp: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo }),
        },
      },
    };

    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        include: { 
          user: { 
            select: { name: true, email: true } 
          } 
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.userActivity.count({ where }),
    ]);

    return { activities, total };
  }
}

// Security Event Services
export class SecurityEventService {
  /**
   * Create security event
   */
  static async create(data: SecurityEventData): Promise<SecurityEvent> {
    return prisma.securityEvent.create({
      data,
    });
  }

  /**
   * Get security events with filtering
   */
  static async findMany(filters: {
    type?: string;
    severity?: string;
    resolved?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ events: SecurityEvent[]; total: number }> {
    const { type, severity, resolved, dateFrom, dateTo, limit = 50, offset = 0 } = filters;

    const where = {
      ...(type && { type }),
      ...(severity && { severity }),
      ...(resolved !== undefined && { resolved }),
      ...(dateFrom || dateTo) && {
        timestamp: {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo }),
        },
      },
    };

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.securityEvent.count({ where }),
    ]);

    return { events, total };
  }

  /**
   * Resolve security event
   */
  static async resolve(id: string, resolvedBy: string): Promise<SecurityEvent> {
    return prisma.securityEvent.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      },
    });
  }

  /**
   * Get unresolved critical events
   */
  static async getCriticalUnresolved(): Promise<SecurityEvent[]> {
    return prisma.securityEvent.findMany({
      where: {
        severity: 'critical',
        resolved: false,
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });
  }
}

// Helper function to log admin actions
export async function logAdminAction(
  adminId: string,
  action: string,
  resource: string,
  resourceId?: string,
  details?: Record<string, any>,
  request?: {
    ip?: string;
    userAgent?: string;
  }
): Promise<AuditLog> {
  return AuditLogService.create({
    adminId,
    action,
    resource,
    resourceId,
    details,
    ipAddress: request?.ip || 'unknown',
    userAgent: request?.userAgent || 'unknown',
  });
}

// Helper function to log security events
export async function logSecurityEvent(
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  details?: Record<string, any>,
  request?: {
    ip?: string;
    userAgent?: string;
    userId?: string;
  }
): Promise<SecurityEvent> {
  return SecurityEventService.create({
    type,
    severity,
    description,
    details,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
    userId: request?.userId,
  });
}

// Authentication helper functions
export async function authenticateAdmin(credentials: {
  email: string;
  password: string;
  mfaCode?: string;
}): Promise<AdminUser | null> {
  const adminUser = await AdminUserService.findByEmail(credentials.email);

  if (!adminUser || !adminUser.isActive || !adminUser.isAdmin) {
    return null;
  }

  // Check if account is locked
  if (adminUser.lockedUntil && new Date() < adminUser.lockedUntil) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }

  // Verify password using the hashPassword utility
  const { verifyPassword } = await import('@/lib/admin');
  const isValidPassword = await verifyPassword(credentials.password, adminUser.passwordHash);
  
  if (!isValidPassword) {
    // Increment login attempts
    await AdminUserService.incrementLoginAttempts(adminUser.id);
    return null;
  }

  // Check MFA if enabled
  if (adminUser.mfaEnabled && credentials.mfaCode) {
    // TODO: Implement MFA verification
    // For now, we'll skip MFA verification
  }

  // Generate session ID
  const jwt = await import('jsonwebtoken');
  const sessionId = jwt.sign(
    { 
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(2)
    },
    process.env.NEXTAUTH_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );

  // Update last login and reset login attempts
  const updatedAdmin = await prisma.adminUser.update({
    where: { id: adminUser.id },
    data: {
      lastLogin: new Date(),
      loginAttempts: 0,
      lockedUntil: null,
      sessionId,
    },
  });

  return updatedAdmin;
}

export async function logoutAdmin(adminId: string): Promise<void> {
  await AdminUserService.update(adminId, { sessionId: null });
}