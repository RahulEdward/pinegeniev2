// AI Token and Pricing Management Seed Data

import { PrismaClient } from '@prisma/client';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

export async function seedTokenPricingData() {
  console.log('🌱 Seeding AI Token and Pricing Management data...');

  try {
    // Get existing users and subscription plans
    const users = await prisma.user.findMany({
      take: 10, // Seed data for first 10 users
    });

    const subscriptionPlans = await prisma.subscriptionPlan.findMany();

    if (users.length === 0) {
      console.log('⚠️  No users found. Please seed users first.');
      return;
    }

    if (subscriptionPlans.length === 0) {
      console.log('⚠️  No subscription plans found. Please seed subscription plans first.');
      return;
    }

    // Get admin user for created_by fields
    const adminUser = await prisma.adminUser.findFirst();
    if (!adminUser) {
      console.log('⚠️  No admin user found. Please create admin user first.');
      return;
    }

    // ============================================================================
    // SEED TOKEN ALLOCATIONS
    // ============================================================================

    console.log('📊 Seeding token allocations...');

    const tokenAllocations = [];
    for (const user of users) {
      // Create 2-3 token allocations per user with different dates
      const allocationsCount = Math.floor(Math.random() * 2) + 2; // 2-3 allocations
      
      for (let i = 0; i < allocationsCount; i++) {
        const tokenAmount = [500, 1000, 1500, 2000, 5000][Math.floor(Math.random() * 5)];
        const daysAgo = Math.floor(Math.random() * 30) + 1; // 1-30 days ago
        const expiresInDays = Math.floor(Math.random() * 60) + 30; // 30-90 days from creation
        
        tokenAllocations.push({
          userId: user.id,
          tokenAmount,
          allocatedBy: adminUser.id,
          reason: [
            'Monthly allocation',
            'Bonus tokens for active user',
            'Promotional allocation',
            'Support compensation',
            'Beta testing reward'
          ][Math.floor(Math.random() * 5)],
          expiresAt: addDays(subDays(new Date(), daysAgo), expiresInDays),
          isActive: Math.random() > 0.1, // 90% active
          createdAt: subDays(new Date(), daysAgo),
        });
      }
    }

    await prisma.tokenAllocation.createMany({
      data: tokenAllocations,
    });

    console.log(`✅ Created ${tokenAllocations.length} token allocations`);

    // ============================================================================
    // SEED TOKEN USAGE LOGS
    // ============================================================================

    console.log('📈 Seeding token usage logs...');

    const tokenUsageLogs = [];
    const requestTypes = ['chat', 'generation', 'analysis'] as const;
    
    for (const user of users) {
      // Create 10-50 usage logs per user
      const logsCount = Math.floor(Math.random() * 40) + 10; // 10-50 logs
      
      for (let i = 0; i < logsCount; i++) {
        const tokensUsed = Math.floor(Math.random() * 500) + 10; // 10-510 tokens
        const cost = (tokensUsed / 1000) * 0.002; // $0.002 per 1K tokens
        const daysAgo = Math.floor(Math.random() * 30); // 0-30 days ago
        const hoursAgo = Math.floor(Math.random() * 24); // 0-24 hours ago
        
        tokenUsageLogs.push({
          userId: user.id,
          modelId: null, // We don't have LLM models in this seed
          tokensUsed,
          cost,
          requestType: requestTypes[Math.floor(Math.random() * requestTypes.length)],
          metadata: {
            sessionId: `session_${Math.random().toString(36).substr(2, 9)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          },
          timestamp: subDays(new Date(), daysAgo),
        });
      }
    }

    await prisma.tokenUsageLog.createMany({
      data: tokenUsageLogs,
    });

    console.log(`✅ Created ${tokenUsageLogs.length} token usage logs`);

    // ============================================================================
    // SEED PROMOTIONS
    // ============================================================================

    console.log('🎯 Seeding promotions...');

    const promotions = [
      {
        name: 'New Year 2024',
        description: 'Special New Year discount for all users',
        type: 'PERCENTAGE' as const,
        value: 25.00,
        code: 'NEWYEAR2024',
        isCodeRequired: true,
        startDate: subDays(new Date(), 60),
        endDate: addDays(new Date(), 30),
        usageLimit: 1000,
        usageCount: Math.floor(Math.random() * 200) + 50, // 50-250 uses
        eligiblePlans: subscriptionPlans.map(p => p.id),
        eligibleUsers: null,
        isActive: true,
        autoApply: false,
        stackable: false,
        createdBy: adminUser.id,
      },
      {
        name: 'First Time User Discount',
        description: 'Welcome discount for new subscribers',
        type: 'FIXED_AMOUNT' as const,
        value: 10.00,
        code: 'WELCOME10',
        isCodeRequired: true,
        startDate: subDays(new Date(), 90),
        endDate: addDays(new Date(), 365),
        usageLimit: null,
        usageCount: Math.floor(Math.random() * 500) + 100, // 100-600 uses
        eligiblePlans: subscriptionPlans.filter(p => p.name !== 'free').map(p => p.id),
        eligibleUsers: null,
        isActive: true,
        autoApply: false,
        stackable: true,
        createdBy: adminUser.id,
      },
      {
        name: 'Summer Sale 2024',
        description: 'Limited time summer promotion',
        type: 'PERCENTAGE' as const,
        value: 30.00,
        code: 'SUMMER30',
        isCodeRequired: true,
        startDate: subDays(new Date(), 30),
        endDate: subDays(new Date(), 5), // Expired
        usageLimit: 500,
        usageCount: 487, // Almost at limit
        eligiblePlans: subscriptionPlans.map(p => p.id),
        eligibleUsers: null,
        isActive: false, // Deactivated
        autoApply: false,
        stackable: false,
        createdBy: adminUser.id,
      },
      {
        name: 'Free Trial Extension',
        description: 'Extended trial period for premium features',
        type: 'FREE_TRIAL' as const,
        value: 14.00, // 14 extra days
        code: null,
        isCodeRequired: false,
        startDate: new Date(),
        endDate: addDays(new Date(), 60),
        usageLimit: null,
        usageCount: Math.floor(Math.random() * 100) + 20, // 20-120 uses
        eligiblePlans: subscriptionPlans.filter(p => p.name === 'free').map(p => p.id),
        eligibleUsers: null,
        isActive: true,
        autoApply: true, // Auto-applied
        stackable: false,
        createdBy: adminUser.id,
      },
      {
        name: 'Upgrade Incentive',
        description: 'Special discount for upgrading users',
        type: 'UPGRADE_DISCOUNT' as const,
        value: 20.00,
        code: 'UPGRADE20',
        isCodeRequired: true,
        startDate: subDays(new Date(), 15),
        endDate: addDays(new Date(), 45),
        usageLimit: 200,
        usageCount: Math.floor(Math.random() * 50) + 10, // 10-60 uses
        eligiblePlans: subscriptionPlans.filter(p => p.name !== 'free').map(p => p.id),
        eligibleUsers: users.slice(0, 5).map(u => u.id), // Targeted to specific users
        isActive: true,
        autoApply: false,
        stackable: false,
        createdBy: adminUser.id,
      },
    ];

    const createdPromotions = await Promise.all(
      promotions.map(promotion => 
        prisma.promotion.create({
          data: promotion,
        })
      )
    );

    console.log(`✅ Created ${createdPromotions.length} promotions`);

    // ============================================================================
    // SEED PROMOTION USAGES
    // ============================================================================

    console.log('💳 Seeding promotion usages...');

    const promotionUsages = [];
    
    // Get some existing subscriptions and payments
    const subscriptions = await prisma.subscription.findMany({
      take: 20,
    });
    
    const payments = await prisma.payment.findMany({
      take: 20,
    });

    for (const promotion of createdPromotions) {
      if (promotion.usageCount > 0) {
        const usagesToCreate = Math.min(promotion.usageCount, 10); // Create up to 10 usage records per promotion
        
        for (let i = 0; i < usagesToCreate; i++) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          const randomSubscription = subscriptions[Math.floor(Math.random() * subscriptions.length)];
          const randomPayment = payments[Math.floor(Math.random() * payments.length)];
          
          let discountAmount = 0;
          if (promotion.type === 'PERCENTAGE') {
            discountAmount = (100 * promotion.value) / 100; // Assuming $100 base amount
          } else if (promotion.type === 'FIXED_AMOUNT') {
            discountAmount = promotion.value;
          }
          
          const daysAgo = Math.floor(Math.random() * 30) + 1; // 1-30 days ago
          
          promotionUsages.push({
            promotionId: promotion.id,
            userId: randomUser.id,
            subscriptionId: randomSubscription?.id || null,
            paymentId: randomPayment?.id || null,
            discountAmount,
            appliedAt: subDays(new Date(), daysAgo),
          });
        }
      }
    }

    if (promotionUsages.length > 0) {
      await prisma.promotionUsage.createMany({
        data: promotionUsages,
      });
    }

    console.log(`✅ Created ${promotionUsages.length} promotion usages`);

    // ============================================================================
    // SEED PRICING CONTENT
    // ============================================================================

    console.log('📝 Seeding pricing content...');

    const pricingContents = [];
    
    for (const plan of subscriptionPlans) {
      const content = {
        planId: plan.id,
        heroTitle: `${plan.displayName} Plan - Perfect for Your Needs`,
        heroSubtitle: `Get started with ${plan.displayName.toLowerCase()} features and unlock your trading potential`,
        features: [
          {
            id: 'feature_1',
            title: 'Advanced Analytics',
            description: 'Comprehensive market analysis tools',
            icon: 'chart-bar',
            highlight: true,
            order: 1,
          },
          {
            id: 'feature_2',
            title: 'Real-time Data',
            description: 'Live market data and updates',
            icon: 'clock',
            highlight: false,
            order: 2,
          },
          {
            id: 'feature_3',
            title: 'Custom Indicators',
            description: 'Build your own technical indicators',
            icon: 'cog',
            highlight: plan.name !== 'free',
            order: 3,
          },
        ],
        benefits: [
          'Increase your trading accuracy',
          'Save time with automated analysis',
          'Access professional-grade tools',
          'Get priority customer support',
        ],
        testimonials: [
          {
            id: 'testimonial_1',
            name: 'John Smith',
            role: 'Professional Trader',
            company: 'TradePro LLC',
            content: `The ${plan.displayName} plan has transformed my trading strategy. Highly recommended!`,
            avatar: null,
            rating: 5,
            featured: true,
          },
          {
            id: 'testimonial_2',
            name: 'Sarah Johnson',
            role: 'Investment Analyst',
            company: 'FinanceCorp',
            content: 'Excellent tools and great value for money. The analytics are top-notch.',
            avatar: null,
            rating: 5,
            featured: false,
          },
        ],
        faq: [
          {
            id: 'faq_1',
            question: `What's included in the ${plan.displayName} plan?`,
            answer: `The ${plan.displayName} plan includes all the features listed above, plus priority support and regular updates.`,
            category: 'features',
            order: 1,
            isPublished: true,
          },
          {
            id: 'faq_2',
            question: 'Can I upgrade or downgrade my plan?',
            answer: 'Yes, you can change your plan at any time. Changes will be reflected in your next billing cycle.',
            category: 'billing',
            order: 2,
            isPublished: true,
          },
          {
            id: 'faq_3',
            question: 'Is there a free trial?',
            answer: `Yes, we offer a ${plan.trialDays}-day free trial for the ${plan.displayName} plan.`,
            category: 'trial',
            order: 3,
            isPublished: true,
          },
        ],
        callToAction: {
          primaryText: `Start Your ${plan.displayName} Journey`,
          secondaryText: 'Join thousands of successful traders',
          buttonText: plan.name === 'free' ? 'Get Started Free' : `Start ${plan.trialDays}-Day Trial`,
          buttonColor: '#3B82F6',
          urgencyText: plan.name !== 'free' ? 'Limited time offer!' : null,
          guaranteeText: '30-day money-back guarantee',
        },
        comparisonTable: null, // Will be populated separately
        isDraft: Math.random() > 0.7, // 30% chance of being draft
        publishedAt: Math.random() > 0.7 ? null : subDays(new Date(), Math.floor(Math.random() * 30)),
        updatedBy: adminUser.id,
      };

      pricingContents.push(content);
    }

    const createdPricingContents = await Promise.all(
      pricingContents.map(content => 
        prisma.pricingContent.create({
          data: content,
        })
      )
    );

    console.log(`✅ Created ${createdPricingContents.length} pricing content records`);

    // ============================================================================
    // SEED PRICING HISTORY
    // ============================================================================

    console.log('📊 Seeding pricing history...');

    const pricingHistories = [];
    
    for (const plan of subscriptionPlans) {
      // Create 2-4 pricing history records per plan
      const historyCount = Math.floor(Math.random() * 3) + 2; // 2-4 records
      
      let currentMonthlyPrice = Number(plan.monthlyPrice);
      let currentAnnualPrice = Number(plan.annualPrice);
      
      for (let i = 0; i < historyCount; i++) {
        const daysAgo = (i + 1) * 30 + Math.floor(Math.random() * 15); // Spread over months
        
        const oldMonthlyPrice = currentMonthlyPrice;
        const oldAnnualPrice = currentAnnualPrice;
        
        // Simulate price changes (increase or decrease by 10-30%)
        const changePercent = (Math.random() * 0.2 + 0.1) * (Math.random() > 0.5 ? 1 : -1); // ±10-30%
        const newMonthlyPrice = Math.max(0, oldMonthlyPrice * (1 + changePercent));
        const newAnnualPrice = Math.max(0, oldAnnualPrice * (1 + changePercent));
        
        currentMonthlyPrice = newMonthlyPrice;
        currentAnnualPrice = newAnnualPrice;
        
        const affectedUsers = Math.floor(Math.random() * 100) + 10; // 10-110 users
        const grandfatheredUsers = Math.floor(affectedUsers * 0.3); // 30% grandfathered
        
        pricingHistories.push({
          planId: plan.id,
          oldMonthlyPrice,
          newMonthlyPrice,
          oldAnnualPrice,
          newAnnualPrice,
          changeReason: [
            'Market adjustment',
            'Feature enhancement',
            'Operational cost changes',
            'Competitive positioning',
            'Value optimization',
          ][Math.floor(Math.random() * 5)],
          effectiveDate: subDays(new Date(), daysAgo),
          affectedUsers,
          grandfatheredUsers,
          createdBy: adminUser.id,
          createdAt: subDays(new Date(), daysAgo + 1), // Created 1 day before effective
        });
      }
    }

    await prisma.pricingHistory.createMany({
      data: pricingHistories,
    });

    console.log(`✅ Created ${pricingHistories.length} pricing history records`);

    console.log('🎉 AI Token and Pricing Management seed data completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding AI Token and Pricing Management data:', error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedTokenPricingData()
    .then(() => {
      console.log('✅ Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}