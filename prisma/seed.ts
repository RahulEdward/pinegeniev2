import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminEmail = 'admin@pinegenie.com';
  const adminPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create test user
  const testUserEmail = 'test@example.com';
  const testUserPassword = await bcrypt.hash('test123', 12);

  const testUser = await prisma.user.upsert({
    where: { email: testUserEmail },
    update: {},
    create: {
      email: testUserEmail,
      name: 'Test User',
      password: testUserPassword,
      role: 'USER',
    },
  });

  console.log('✅ Created test user:', testUser.email);

  // Create default AI models
  const defaultModels = [
    {
      name: 'gpt-4',
      provider: 'openai',
      modelId: 'gpt-4',
      displayName: 'GPT-4',
      description: 'Most capable GPT-4 model, great for complex tasks',
      isActive: true,
      isDefault: true,
      maxTokens: 8192,
      costPer1kTokens: 0.03,
    },
    {
      name: 'gpt-4-turbo',
      provider: 'openai',
      modelId: 'gpt-4-turbo',
      displayName: 'GPT-4 Turbo',
      description: 'Faster and more efficient GPT-4 model',
      isActive: true,
      isDefault: false,
      maxTokens: 128000,
      costPer1kTokens: 0.01,
    },
    {
      name: 'gpt-3.5-turbo',
      provider: 'openai',
      modelId: 'gpt-3.5-turbo',
      displayName: 'GPT-3.5 Turbo',
      description: 'Fast and cost-effective model for most tasks',
      isActive: true,
      isDefault: false,
      maxTokens: 4096,
      costPer1kTokens: 0.002,
    },
    {
      name: 'claude-3-opus',
      provider: 'claude',
      modelId: 'claude-3-opus-20240229',
      displayName: 'Claude 3 Opus',
      description: 'Most powerful Claude model for complex reasoning',
      isActive: true,
      isDefault: false,
      maxTokens: 200000,
      costPer1kTokens: 0.015,
    },
    {
      name: 'claude-3-sonnet',
      provider: 'claude',
      modelId: 'claude-3-sonnet-20240229',
      displayName: 'Claude 3 Sonnet',
      description: 'Balanced Claude model for most use cases',
      isActive: true,
      isDefault: false,
      maxTokens: 200000,
      costPer1kTokens: 0.003,
    },
    {
      name: 'claude-3-haiku',
      provider: 'claude',
      modelId: 'claude-3-haiku-20240307',
      displayName: 'Claude 3 Haiku',
      description: 'Fastest Claude model for simple tasks',
      isActive: true,
      isDefault: false,
      maxTokens: 200000,
      costPer1kTokens: 0.00025,
    },
  ];

  for (const modelData of defaultModels) {
    const model = await prisma.lLMModel.upsert({
      where: { name: modelData.name },
      update: {},
      create: modelData,
    });
    console.log('✅ Created model:', model.displayName);
  }

  // Create single admin user (enforced by database constraint)
  const singleAdminEmail = 'admin@pinegenie.com';
  const singleAdminPassword = await bcrypt.hash('admin123', 12);

  const singleAdmin = await prisma.adminUser.upsert({
    where: { email: singleAdminEmail },
    update: {},
    create: {
      email: singleAdminEmail,
      name: 'System Administrator',
      passwordHash: singleAdminPassword,
      isAdmin: true, // Always true - single admin model
      mfaEnabled: false,
      isActive: true,
    },
  });

  console.log('✅ Created single admin:', singleAdmin.email);

  // Create initial system metrics
  const initialMetrics = await prisma.systemMetrics.create({
    data: {
      cpuUsage: 25.5,
      memoryUsage: 60.2,
      diskUsage: 45.8,
      activeUsers: 0,
      apiRequests: 0,
      errorRate: 0.0,
      responseTime: 150.0,
      dbConnections: 5,
      queueSize: 0,
    },
  });

  console.log('✅ Created initial system metrics');

  // Create sample audit log
  await prisma.auditLog.create({
    data: {
      adminId: singleAdmin.id,
      action: 'SYSTEM_SEED',
      resource: 'DATABASE',
      details: {
        description: 'Database seeded with initial data for single admin model',
        timestamp: new Date().toISOString(),
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Prisma Seed Script',
    },
  });

  console.log('✅ Created initial audit log');

  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('User credentials:');
  console.log('Regular User - Email:', adminEmail, 'Password: admin123');
  console.log('Test User - Email:', testUserEmail, 'Password: test123');
  console.log('');
  console.log('Single Admin Dashboard credentials:');
  console.log('Admin - Email:', singleAdminEmail, 'Password: admin123');
  console.log('');
  console.log('Remember to:');
  console.log('1. Add your OPENAI_API_KEY to .env.local');
  console.log('2. Add your ANTHROPIC_API_KEY to .env.local');
  console.log('3. Change admin password after first login');
  console.log('4. Enable MFA for admin account in production');
  console.log('5. Only ONE admin account exists - this enforces the single admin model');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });