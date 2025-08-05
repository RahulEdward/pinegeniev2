#!/usr/bin/env tsx

/**
 * Create Test User Script
 * 
 * Creates a test user account for development and testing
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('👤 Creating test user...');

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@pinegenie.com' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log('   Email: admin@pinegenie.com');
      console.log('   Password: admin123');
      return;
    }

    // Hash the password
    const hashedPassword = await hash('admin123', 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: 'admin@pinegenie.com',
        name: 'Pine Genie Admin',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date()
      }
    });

    console.log('✅ Test user created successfully!');
    console.log('   ID:', user.id);
    console.log('   Email: admin@pinegenie.com');
    console.log('   Password: admin123');
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('');
    console.log('🔐 You can now log in with these credentials');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      console.log('ℹ️  User may already exist. Try logging in with:');
      console.log('   Email: admin@pinegenie.com');
      console.log('   Password: admin123');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestUser();