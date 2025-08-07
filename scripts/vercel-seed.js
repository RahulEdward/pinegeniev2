#!/usr/bin/env node

/**
 * Vercel Database Seeding Script
 * Seeds the production database with initial users and data
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedVercelDatabase() {
  console.log('🌱 Seeding Vercel production database...');

  try {
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

    // Create demo user for public access
    const demoEmail = 'demo@pinegenie.com';
    const demoPassword = await bcrypt.hash('demo123', 12);

    const demoUser = await prisma.user.upsert({
      where: { email: demoEmail },
      update: {},
      create: {
        email: demoEmail,
        name: 'Demo User',
        password: demoPassword,
        role: 'USER',
      },
    });

    console.log('✅ Created demo user:', demoUser.email);

    console.log('🎉 Vercel database seeding completed!');
    console.log('');
    console.log('Login credentials:');
    console.log('Admin - Email: admin@pinegenie.com, Password: admin123');
    console.log('Test - Email: test@example.com, Password: test123');
    console.log('Demo - Email: demo@pinegenie.com, Password: demo123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedVercelDatabase()
    .then(() => {
      console.log('✅ Seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedVercelDatabase };