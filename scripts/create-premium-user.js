/**
 * Create Premium User Script
 * Creates a user with premium access for testing
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createPremiumUser() {
  try {
    console.log('🚀 Creating premium user...\n');

    // User credentials
    const email = 'premium@pinegenie.com';
    const password = 'premium123';
    const name = 'Premium User';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password: hashedPassword,
        role: 'USER'
      },
      create: {
        email,
        name,
        password: hashedPassword,
        role: 'USER'
      }
    });

    console.log('✅ User created/updated:', user.email);

    // Find or create Pro plan
    let proPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: 'pro' }
    });

    if (!proPlan) {
      proPlan = await prisma.subscriptionPlan.create({
        data: {
          name: 'pro',
          displayName: 'Pro Plan',
          description: 'Professional plan with all premium features',
          monthlyPrice: 29.99,
          annualPrice: 299.99,
          currency: 'USD',
          features: [
            'Unlimited AI conversations',
            'Advanced strategy builder',
            'Premium templates access',
            'Priority support',
            'Export capabilities',
            'Advanced indicators',
            'Backtesting features'
          ],
          limits: {
            aiChatAccess: true,
            templatesAccess: 'all',
            scriptStorage: 'unlimited',
            aiGenerations: 'unlimited',
            advancedIndicators: true,
            backtesting: true,
            customSignatures: true,
            apiAccess: true,
            whiteLabel: false,
            teamCollaboration: false,
            supportLevel: 'priority'
          },
          isActive: true,
          isPopular: true
        }
      });
      console.log('✅ Pro plan created');
    }

    // Cancel any existing active subscriptions
    await prisma.subscription.updateMany({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      },
      data: {
        status: 'CANCELED'
      }
    });

    // Create premium subscription (1 year)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from now

    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: proPlan.id,
        status: 'ACTIVE',
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false
      }
    });

    console.log('✅ Premium subscription created');
    console.log('📅 Valid until:', endDate.toLocaleDateString());

    // Allocate premium tokens
    const adminUser = await prisma.adminUser.findFirst({
      where: { isActive: true }
    });

    if (adminUser) {
      await prisma.tokenAllocation.create({
        data: {
          userId: user.id,
          tokenAmount: 1000000, // 1 million tokens
          allocatedBy: adminUser.id,
          reason: 'Premium user initial allocation',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          isActive: true
        }
      });
      console.log('✅ Premium tokens allocated: 1,000,000');
    }

    console.log('\n🎉 Premium user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('📦 Plan: Pro (Premium Features)');
    console.log('⏰ Expires:', endDate.toLocaleDateString());
    console.log('\n🚀 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating premium user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createPremiumUser();
}

module.exports = { createPremiumUser };