#!/usr/bin/env tsx

/**
 * Create Demo Users Script
 * 
 * Creates demo user accounts for development and testing
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoUsers() {
  console.log('👥 Creating demo users...\n');

  try {
    // Demo users to create
    const demoUsers = [
      {
        email: 'admin@pinegenie.com',
        name: 'Pine Genie Admin',
        password: 'admin123',
        role: 'ADMIN'
      },
      {
        email: 'test@example.com',
        name: 'Test User',
        password: 'test123',
        role: 'USER'
      }
    ];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists`);
        continue;
      }

      // Hash the password
      const hashedPassword = await hash(userData.password, 12);

      // Create the user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role as any,
          emailVerified: new Date()
        }
      });

      console.log(`✅ Created user: ${userData.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password: ${userData.password}\n`);
    }

    console.log('🎉 Demo users setup complete!\n');
    console.log('🔐 Login Credentials:');
    console.log('   Admin: admin@pinegenie.com / admin123');
    console.log('   User:  test@example.com / test123');
    console.log('\n📋 You can now log in with either account');

  } catch (error) {
    console.error('❌ Error creating demo users:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      console.log('\nℹ️  Some users may already exist. Try logging in with:');
      console.log('   Admin: admin@pinegenie.com / admin123');
      console.log('   User:  test@example.com / test123');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDemoUsers();