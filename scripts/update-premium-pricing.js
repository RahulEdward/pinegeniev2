#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePremiumPlanPricing() {
  try {
    console.log('🔄 Updating Premium plan pricing...');

    // Find the Premium plan
    const premiumPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: 'premium' }
    });

    if (!premiumPlan) {
      console.log('❌ Premium plan not found. Creating new Premium plan...');
      
      // Create Premium plan with new pricing
      const newPremiumPlan = await prisma.subscriptionPlan.create({
        data: {
          name: 'premium',
          displayName: 'Premium',
          description: 'For teams and organizations with advanced needs',
          monthlyPrice: 2998.00,
          annualPrice: 29980.00, // 10 months price for annual
          currency: 'INR',
          features: [
            {
              id: 'ai_credits_1000',
              name: '1000 AI Credits Monthly',
              description: '1000 AI credits monthly - auto-refreshed!',
              included: true
            },
            {
              id: 'unlimited_indicators',
              name: 'Unlimited Indicators & Strategies',
              description: 'Unlimited indicators, strategies & screeners',
              included: true
            },
            {
              id: 'technical_analysis',
              name: 'Technical Analysis Indicators',
              description: 'Technical analysis indicators included',
              included: true
            },
            {
              id: 'multi_timeframe',
              name: 'Multi-timeframe & Multi-symbol',
              description: 'Multi-timeframe & multi-symbol support',
              included: true
            },
            {
              id: 'priority_discord',
              name: 'Priority Discord Support',
              description: 'Priority support via exclusive Discord',
              included: true
            },
            {
              id: 'import_customize',
              name: 'Import & Customize Code',
              description: 'Import & customize your existing code',
              included: true
            }
          ],
          limits: {
            strategiesPerMonth: 'unlimited',
            templatesAccess: 'all',
            aiGenerations: 1000,
            aiChatAccess: true,
            scriptStorage: 'unlimited',
            exportFormats: ['pine', 'json', 'txt', 'xml'],
            supportLevel: 'dedicated',
            customSignatures: true,
            apiAccess: true,
            whiteLabel: true,
            teamCollaboration: true,
            advancedIndicators: true,
            backtesting: true
          },
          isPopular: false,
          trialDays: 30,
          isActive: true
        }
      });

      console.log('✅ Premium plan created successfully!');
      console.log(`📊 New pricing: ₹${newPremiumPlan.monthlyPrice}/month`);
      return;
    }

    // Update existing Premium plan
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { name: 'premium' },
      data: {
        monthlyPrice: 2998.00,
        annualPrice: 29980.00, // 10 months price for annual
        currency: 'INR',
        displayName: 'Premium',
        description: 'For teams and organizations with advanced needs',
        features: [
          {
            id: 'ai_credits_1000',
            name: '1000 AI Credits Monthly',
            description: '1000 AI credits monthly - auto-refreshed!',
            included: true
          },
          {
            id: 'unlimited_indicators',
            name: 'Unlimited Indicators & Strategies',
            description: 'Unlimited indicators, strategies & screeners',
            included: true
          },
          {
            id: 'technical_analysis',
            name: 'Technical Analysis Indicators',
            description: 'Technical analysis indicators included',
            included: true
          },
          {
            id: 'multi_timeframe',
            name: 'Multi-timeframe & Multi-symbol',
            description: 'Multi-timeframe & multi-symbol support',
            included: true
          },
          {
            id: 'priority_discord',
            name: 'Priority Discord Support',
            description: 'Priority support via exclusive Discord',
            included: true
          },
          {
            id: 'import_customize',
            name: 'Import & Customize Code',
            description: 'Import & customize your existing code',
            included: true
          }
        ],
        limits: {
          strategiesPerMonth: 'unlimited',
          templatesAccess: 'all',
          aiGenerations: 1000,
          aiChatAccess: true,
          scriptStorage: 'unlimited',
          exportFormats: ['pine', 'json', 'txt', 'xml'],
          supportLevel: 'dedicated',
          customSignatures: true,
          apiAccess: true,
          whiteLabel: true,
          teamCollaboration: true,
          advancedIndicators: true,
          backtesting: true
        },
        isPopular: false,
        trialDays: 30,
        isActive: true
      }
    });

    console.log('✅ Premium plan updated successfully!');
    console.log(`📊 Old pricing: ₹${premiumPlan.monthlyPrice}/month`);
    console.log(`📊 New pricing: ₹${updatedPlan.monthlyPrice}/month`);
    console.log(`💰 Savings: ₹${Number(premiumPlan.monthlyPrice) - Number(updatedPlan.monthlyPrice)}/month`);

  } catch (error) {
    console.error('❌ Error updating Premium plan pricing:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updatePremiumPlanPricing()
  .then(() => {
    console.log('🎉 Premium plan pricing update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to update Premium plan pricing:', error);
    process.exit(1);
  });