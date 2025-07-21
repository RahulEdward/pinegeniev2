# Admin Database Schema Documentation

This document describes the database schema and models for the PineGenie Admin Dashboard System.

## Overview

The admin database schema consists of three main tables:
- `admin_users` - Admin user accounts with roles and permissions
- `audit_logs` - Comprehensive audit trail of all admin actions
- `system_metrics` - System performance and health monitoring data

## Tables

### admin_users

Stores admin user accounts with role-based access control.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique identifier (CUID) |
| email | TEXT (UNIQUE) | Admin email address |
| name | TEXT | Full name of admin user |
| role | AdminRole | Admin role (SUPER_ADMIN, ADMIN, MODERATOR) |
| permissions | AdminPermission[] | Array of explicit permissions |
| password_hash | TEXT | Bcrypt hashed password |
| mfa_enabled | BOOLEAN | Whether MFA is enabled |
| mfa_secret | TEXT | MFA secret key (encrypted) |
| is_active | BOOLEAN | Whether account is active |
| last_login | TIMESTAMP | Last successful login time |
| login_attempts | INTEGER | Failed login attempt counter |
| locked_until | TIMESTAMP | Account lock expiration time |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

### audit_logs

Comprehensive audit trail for compliance and security monitoring.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique identifier (CUID) |
| admin_id | TEXT (FK) | Reference to admin_users.id |
| action | TEXT | Action performed (e.g., "USER_UPDATE") |
| resource | TEXT | Resource type (e.g., "USER", "SYSTEM") |
| resource_id | TEXT | Specific resource ID (optional) |
| details | JSONB | Additional action details |
| ip_address | TEXT | IP address of admin |
| user_agent | TEXT | Browser/client user agent |
| timestamp | TIMESTAMP | When action occurred |

**Indexes:**
- `admin_id` - For filtering by admin user
- `timestamp` - For time-based queries
- `action` - For filtering by action type
- `resource` - For filtering by resource type

### system_metrics

System performance and health monitoring data.

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique identifier (CUID) |
| timestamp | TIMESTAMP | When metrics were recorded |
| cpu_usage | FLOAT | CPU usage percentage |
| memory_usage | FLOAT | Memory usage percentage |
| disk_usage | FLOAT | Disk usage percentage |
| active_users | INTEGER | Number of active users |
| api_requests | INTEGER | API requests in time period |
| error_rate | FLOAT | Error rate percentage |
| response_time | FLOAT | Average response time (ms) |
| db_connections | INTEGER | Active database connections |
| queue_size | INTEGER | Background job queue size |

**Indexes:**
- `timestamp` - For time-series queries

## Enums

### AdminRole

Hierarchical admin roles with different privilege levels:

- `SUPER_ADMIN` - Full system access, all permissions
- `ADMIN` - Standard admin access, most permissions
- `MODERATOR` - Limited access, content moderation only

### AdminPermission

Granular permissions for fine-grained access control:

- `USER_MANAGEMENT` - Manage user accounts
- `BILLING_ACCESS` - Access billing and financial data
- `CONTENT_MODERATION` - Moderate user content
- `SYSTEM_CONFIG` - Configure system settings
- `ANALYTICS_VIEW` - View analytics and reports
- `SECURITY_AUDIT` - Access security logs and settings
- `LLM_MANAGEMENT` - Manage AI models and settings
- `BACKUP_RESTORE` - Perform backup and restore operations

## Services

### AdminUserService

Provides CRUD operations for admin users:

```typescript
// Find admin by email
const admin = await AdminUserService.findByEmail('admin@example.com');

// Create new admin
const newAdmin = await AdminUserService.create({
  email: 'new@example.com',
  name: 'New Admin',
  password: 'secure-password',
  role: AdminRole.ADMIN,
  permissions: [AdminPermission.USER_MANAGEMENT]
});

// Update admin
await AdminUserService.update(adminId, {
  name: 'Updated Name',
  permissions: [AdminPermission.USER_MANAGEMENT, AdminPermission.ANALYTICS_VIEW]
});
```

### AuditLogService

Manages audit logging for compliance:

```typescript
// Create audit log
await AuditLogService.create({
  adminId: 'admin-id',
  action: 'USER_UPDATE',
  resource: 'USER',
  resourceId: 'user-id',
  details: { field: 'email', oldValue: 'old@example.com', newValue: 'new@example.com' },
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...'
});

// Query audit logs
const { logs, total } = await AuditLogService.findMany({
  adminId: 'admin-id',
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-31'),
  limit: 50
});
```

### SystemMetricsService

Records and retrieves system performance data:

```typescript
// Record metrics
await SystemMetricsService.record({
  cpuUsage: 45.2,
  memoryUsage: 67.8,
  diskUsage: 23.1,
  activeUsers: 150,
  apiRequests: 1250,
  errorRate: 0.5,
  responseTime: 125.3,
  dbConnections: 8,
  queueSize: 5
});

// Get latest metrics
const latest = await SystemMetricsService.getLatest();

// Get metrics for time period
const metrics = await SystemMetricsService.findMany({
  dateFrom: new Date('2025-01-01'),
  dateTo: new Date('2025-01-31')
});
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 12
- Password complexity requirements enforced at application level
- Password history tracking to prevent reuse

### Account Security
- Failed login attempt tracking with automatic account locking
- Configurable lockout duration (default: 30 minutes after 5 failed attempts)
- Multi-factor authentication support with TOTP

### Audit Trail
- All admin actions are logged with full context
- IP address and user agent tracking
- Immutable audit logs for compliance
- Configurable retention periods

### Permission System
- Role-based access control (RBAC) with hierarchical roles
- Granular permissions for fine-grained access control
- Permission inheritance from roles with explicit overrides
- Runtime permission checking utilities

## Migration and Seeding

### Initial Setup

```bash
# Generate and apply migration
npx prisma migrate dev --name add-admin-schema

# Seed database with initial admin users
npm run db:seed
```

### Default Admin Accounts

The seed script creates three default admin accounts:

1. **Super Admin**
   - Email: `superadmin@pinegenie.com`
   - Password: `superadmin123`
   - Role: `SUPER_ADMIN`
   - All permissions

2. **Admin**
   - Email: `admin@pinegenie.com`
   - Password: `admin123`
   - Role: `ADMIN`
   - Standard admin permissions

3. **Moderator**
   - Email: `moderator@pinegenie.com`
   - Password: `moderator123`
   - Role: `MODERATOR`
   - Content moderation permissions only

> **Important:** Change all default passwords immediately after deployment!

## Testing

Run the database schema test to verify everything is working:

```bash
npx tsx src/lib/test-admin-db.ts
```

This test verifies:
- Admin user creation and retrieval
- Audit log functionality
- System metrics recording
- Database relationships and constraints

## Maintenance

### Cleanup Tasks

Implement regular cleanup tasks for:

```typescript
// Clean up old audit logs (older than 1 year)
await AuditLogService.deleteOldLogs(365);

// Clean up old system metrics (older than 90 days)
await SystemMetricsService.deleteOldMetrics(90);
```

### Monitoring

Monitor the following metrics:
- Admin login frequency and patterns
- Failed login attempts and account lockouts
- Audit log growth rate
- System metrics collection frequency
- Database performance for admin queries

## Best Practices

1. **Security**
   - Always use HTTPS for admin interfaces
   - Implement IP whitelisting for admin access
   - Enable MFA for all admin accounts
   - Regularly rotate admin passwords
   - Monitor audit logs for suspicious activity

2. **Performance**
   - Use database indexes for common query patterns
   - Implement pagination for large result sets
   - Cache frequently accessed admin data
   - Archive old audit logs and metrics

3. **Compliance**
   - Maintain comprehensive audit trails
   - Implement data retention policies
   - Regular security audits and reviews
   - Document all admin procedures and policies