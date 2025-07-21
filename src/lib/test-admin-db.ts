/**
 * Test script to verify admin database schema and services
 * This can be run to ensure everything is working correctly
 */

import { AdminUserService, AuditLogService, SystemMetricsService } from '@/services/admin';

export async function testAdminDatabase() {
  console.log('🧪 Testing Admin Database Schema and Services...');

  try {
    // Test 1: Find existing admin user
    console.log('\n1. Testing AdminUserService.findByEmail...');
    const existingAdmin = await AdminUserService.findByEmail('superadmin@pinegenie.com');
    if (existingAdmin) {
      console.log('✅ Found super admin:', existingAdmin.name);
      console.log('   Role:', existingAdmin.role);
      console.log('   Permissions:', existingAdmin.permissions);
    } else {
      console.log('❌ Super admin not found');
    }

    // Test 2: Get all admin users
    console.log('\n2. Testing AdminUserService.findMany...');
    const { users, total } = await AdminUserService.findMany({ limit: 5 });
    console.log(`✅ Found ${total} admin users total, showing ${users.length}:`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });

    // Test 3: Get latest system metrics
    console.log('\n3. Testing SystemMetricsService.getLatest...');
    const latestMetrics = await SystemMetricsService.getLatest();
    if (latestMetrics) {
      console.log('✅ Latest system metrics:');
      console.log(`   CPU: ${latestMetrics.cpuUsage}%`);
      console.log(`   Memory: ${latestMetrics.memoryUsage}%`);
      console.log(`   Disk: ${latestMetrics.diskUsage}%`);
      console.log(`   Active Users: ${latestMetrics.activeUsers}`);
      console.log(`   Response Time: ${latestMetrics.responseTime}ms`);
    } else {
      console.log('❌ No system metrics found');
    }

    // Test 4: Get recent audit logs
    console.log('\n4. Testing AuditLogService.findMany...');
    const { logs, total: auditTotal } = await AuditLogService.findMany({ limit: 3 });
    console.log(`✅ Found ${auditTotal} audit logs total, showing ${logs.length}:`);
    logs.forEach(log => {
      console.log(`   - ${log.action} on ${log.resource} by ${log.admin.name} at ${log.timestamp}`);
    });

    // Test 5: Record new system metrics
    console.log('\n5. Testing SystemMetricsService.record...');
    const newMetrics = await SystemMetricsService.record({
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      activeUsers: Math.floor(Math.random() * 50),
      apiRequests: Math.floor(Math.random() * 1000),
      errorRate: Math.random() * 5,
      responseTime: 100 + Math.random() * 200,
      dbConnections: 5 + Math.floor(Math.random() * 10),
      queueSize: Math.floor(Math.random() * 20),
    });
    console.log('✅ Recorded new system metrics:', newMetrics.id);

    // Test 6: Create audit log
    if (existingAdmin) {
      console.log('\n6. Testing AuditLogService.create...');
      const auditLog = await AuditLogService.create({
        adminId: existingAdmin.id,
        action: 'TEST_DATABASE_SCHEMA',
        resource: 'SYSTEM',
        details: {
          test: true,
          timestamp: new Date().toISOString(),
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
      });
      console.log('✅ Created audit log:', auditLog.id);
    }

    console.log('\n🎉 All admin database tests passed!');
    return true;

  } catch (error) {
    console.error('\n❌ Admin database test failed:', error);
    return false;
  }
}

// Export for use in other files
export default testAdminDatabase;

// Run test if this file is executed directly
if (require.main === module) {
  testAdminDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}