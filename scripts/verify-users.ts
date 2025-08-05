#!/usr/bin/env tsx

/**
 * Verify Users Script
 * 
 * Checks if demo users exist and can authenticate
 */

import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyUsers() {
  console.log('🔍 Verifying demo users...\n');

  try {
    const testCredentials = [
      { email: 'admin@pinegenie.com', password: 'admin123' },
      { email: 'test@example.com', password: 'test123' }
    ];

    for (const creds of testCredentials) {
      console.log(`🔐 Testing: ${creds.email}`);
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: creds.email }
      });

      if (!user) {
        console.log(`❌ User not found: ${creds.email}\n`);
        continue;
      }

      console.log(`✅ User found: ${user.name} (${user.role})`);
      
      // Test password
      const isPasswordValid = await compare(creds.password, user.password);
      console.log(`🔑 Password valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`);
      
      if (!isPasswordValid) {
        console.log(`🔧 Fixing password for ${creds.email}...`);
        const { hash } = await import('bcryptjs');
        const hashedPassword = await hash(creds.password, 12);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
        
        console.log(`✅ Password updated for ${creds.email}`);
      }
      
      console.log('');
    }

    console.log('🎉 User verification complete!');
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@pinegenie.com / admin123');
    console.log('   User:  test@example.com / test123');

  } catch (error) {
    console.error('❌ Error verifying users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
verifyUsers();