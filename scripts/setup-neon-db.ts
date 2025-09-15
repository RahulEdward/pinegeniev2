#!/usr/bin/env tsx

/**
 * Neon Database Setup Script
 * 
 * This script sets up the Pine Genie database on Neon PostgreSQL
 * with all necessary tables, indexes, and seed data.
 */

// Load environment variables
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env files in order of precedence
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';
import { seedSubscriptionPlans } from '../prisma/seeds/subscription-plans';

const prisma = new PrismaClient();

async function setupNeonDatabase() {
  console.log('🚀 Setting up Pine Genie database on Neon...\n');

  try {
    // Test database connection
    console.log('🔗 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');

    // Check if database is already set up
    console.log('🔍 Checking existing database structure...');
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Found ${userCount} existing users`);
    } catch (error) {
      console.log('📝 Database appears to be empty, proceeding with setup...');
    }

    // Run Prisma migrations
    console.log('\n🔄 Running database migrations...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations completed successfully!');
    } catch (error) {
      console.log('⚠️  Migration may have already been applied or failed');
      console.log('Continuing with seed data...');
    }

    // Generate Prisma client
    console.log('\n🔧 Generating Prisma client...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Prisma client generated successfully!');
    } catch (error) {
      console.log('⚠️  Prisma client generation failed, but continuing...');
    }

    // Seed subscription plans
    console.log('\n🌱 Seeding subscription plans...');
    await seedSubscriptionPlans();

    // Create default admin user if it doesn't exist
    console.log('\n👤 Setting up default admin user...');
    const adminExists = await prisma.adminUser.findFirst();
    
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await prisma.adminUser.create({
        data: {
          email: 'admin@pinegenie.com',
          name: 'Pine Genie Admin',
          passwordHash: hashedPassword,
          isAdmin: true,
          isActive: true
        }
      });
      
      console.log('✅ Default admin user created!');
      console.log('   Email: admin@pinegenie.com');
      console.log('   Password: admin123');
      console.log('   ⚠️  Please change this password after first login!');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Verify database setup
    console.log('\n🔍 Verifying database setup...');
    
    const planCount = await prisma.subscriptionPlan.count();
    const adminCount = await prisma.adminUser.count();
    
    console.log(`📊 Database verification:`);
    console.log(`   - Subscription plans: ${planCount}`);
    console.log(`   - Admin users: ${adminCount}`);

    if (planCount >= 3 && adminCount >= 1) {
      console.log('\n🎉 Database setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Update your .env.local with Neon database credentials');
      console.log('   2. Configure PayU payment gateway credentials');
      console.log('   3. Set up email configuration for invoices');
      console.log('   4. Start the development server: npm run dev');
      console.log('\n🔗 Useful commands:');
      console.log('   - View database: npx prisma studio');
      console.log('   - Reset database: npx prisma migrate reset');
      console.log('   - Deploy migrations: npx prisma migrate deploy');
    } else {
      console.log('\n⚠️  Database setup may be incomplete');
      console.log('Please check the logs above for any errors');
    }

  } catch (error) {
    console.error('\n❌ Database setup failed:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      
      if (error.message.includes('connection')) {
        console.log('\n💡 Connection troubleshooting:');
        console.log('   1. Check your DATABASE_URL in .env.local');
        console.log('   2. Ensure your Neon database is running');
        console.log('   3. Verify your network connection');
        console.log('   4. Check if your IP is whitelisted in Neon');
      }
      
      if (error.message.includes('migration')) {
        console.log('\n💡 Migration troubleshooting:');
        console.log('   1. Try: npx prisma migrate reset');
        console.log('   2. Then: npx prisma migrate dev');
        console.log('   3. Finally: npm run setup-db');
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Database health check
async function healthCheck() {
  console.log('🏥 Running database health check...\n');
  
  try {
    await prisma.$connect();
    
    // Test basic operations
    const planCount = await prisma.subscriptionPlan.count();
    const userCount = await prisma.user.count();
    
    console.log('✅ Database health check passed!');
    console.log(`   - Connection: OK`);
    console.log(`   - Subscription plans: ${planCount}`);
    console.log(`   - Users: ${userCount}`);
    
    // Test payment system tables
    try {
      await prisma.payment.count();
      await prisma.subscription.count();
      await prisma.invoice.count();
      console.log(`   - Payment system: OK`);
    } catch (error) {
      console.log(`   - Payment system: ❌ Not set up`);
    }
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupNeonDatabase();
    break;
  case 'health':
    healthCheck();
    break;
  case 'seed':
    seedSubscriptionPlans().then(() => {
      console.log('✅ Seeding completed!');
      process.exit(0);
    }).catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
    break;
  default:
    console.log('🔧 Pine Genie Database Setup Tool\n');
    console.log('Usage:');
    console.log('  npm run setup-db setup  - Full database setup');
    console.log('  npm run setup-db health - Database health check');
    console.log('  npm run setup-db seed   - Seed subscription plans only');
    console.log('\nMake sure to configure your .env.local file first!');
}