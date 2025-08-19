#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateProPlanPricing() {
  try {
    console.log('🔄 Updating Pro plan pricing...');

    // Find the Pro plan
    const proPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: 'pro' }
    });

    if (!proPlan) {
      console.log('❌ Pro plan not found. Creating new Pro plan...');
      
      // Create Pro plan with new pricing
      const newProPlan = await prisma.subscriptionPlan.create({
        data: {
          name: 'pro',
          displayName: 'Pro',
          description: 'For serious traders',
          monthlyPrice: 1499.00,
          annualPrice: 14990.00, // 10 months price for annual
          currency: 'INR',
          features: [
            {
              id: 'ai_credits',
              name: '500 AI Credits Monthly',
              description: 'Auto-refreshed, no extra charges!',
              included: true
            },
            {
              id: 'unlimited_strategies',
              name: 'Unlimited Strategies',
              description: 'Create unlimited indicators, strategies & screeners',
              included: true
            },
            {
              id: 'unlimited_inputs',
              name: 'Unlimited Inputs & Conditions',
              description: 'Unlimited inputs, conditions, alerts & plots',
              included: true
            },
            {
              id: 'technical_indicators',
              name: '100+ Technical Indicators',
              description: 'All technical analysis indicators included',
              included: true
            },
            {
              id: 'multi_timeframe',
              name: 'Multi-timeframe Support',
              description: 'Multi-timeframe & multi-symbol support',
              included: true
            },
            {
              id: 'import_code',
              name: 'Import & Customize Code',
              description: 'Import & customize your existing code',
              included: true
            },
            {
              id: 'priority_support',
              name: 'Priority Support',
              description: 'Priority support via exclusive Discord',
              included: true
            }
          ],
          limits: {
            strategiesPerMonth: 'unlimited',
            templatesAccess: 'all',
            aiGenerations: 500,
            aiChatAccess: true,
            scriptStorage: 'unlimited',
            exportFormats: ['pine', 'json', 'txt'],
            supportLevel: 'priority',
            customSignatures: true,
            apiAccess: true,
            whiteLabel: false,
            teamCollaboration: false,
            advancedIndicators: true,
            backtesting: true
          },
          isPopular: true,
          trialDays: 7,
          isActive: true
        }
      });

      console.log('✅ Pro plan created successfully!');
      console.log(`📊 New pricing: ₹${newProPlan.monthlyPrice}/month`);
      return;
    }

    // Update existing Pro plan
    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { name: 'pro' },
      data: {
        monthlyPrice: 1499.00,
        annualPrice: 14990.00, // 10 months price for annual
        currency: 'INR',
        displayName: 'Pro',
        description: 'For serious traders',
        features: [
          {
            id: 'ai_credits',
            name: '500 AI Credits Monthly',
            description: 'Auto-refreshed, no extra charges!',
            included: true
          },
          {
            id: 'unlimited_strategies',
            name: 'Unlimited Strategies',
            description: 'Create unlimited indicators, strategies & screeners',
            included: true
          },
          {
            id: 'unlimited_inputs',
            name: 'Unlimited Inputs & Conditions',
            description: 'Unlimited inputs, conditions, alerts & plots',
            included: true
          },
          {
            id: 'technical_indicators',
            name: '100+ Technical Indicators',
            description: 'All technical analysis indicators included',
            included: true
          },
          {
            id: 'multi_timeframe',
            name: 'Multi-timeframe Support',
            description: 'Multi-timeframe & multi-symbol support',
            included: true
          },
          {
            id: 'import_code',
            name: 'Import & Customize Code',
            description: 'Import & customize your existing code',
            included: true
          },
          {
            id: 'priority_support',
            name: 'Priority Support',
            description: 'Priority support via exclusive Discord',
            included: true
          }
        ],
        limits: {
          strategiesPerMonth: 'unlimited',
          templatesAccess: 'all',
          aiGenerations: 500,
          aiChatAccess: true,
          scriptStorage: 'unlimited',
          exportFormats: ['pine', 'json', 'txt'],
          supportLevel: 'priority',
          customSignatures: true,
          apiAccess: true,
          whiteLabel: false,
          teamCollaboration: false,
          advancedIndicators: true,
          backtesting: true
        },
        isPopular: true,
        trialDays: 7,
        isActive: true
      }
    });

    console.log('✅ Pro plan updated successfully!');
    console.log(`📊 Old pricing: ₹${proPlan.monthlyPrice}/month`);
    console.log(`📊 New pricing: ₹${updatedPlan.monthlyPrice}/month`);
    console.log(`💰 Savings: ₹${Number(proPlan.monthlyPrice) - Number(updatedPlan.monthlyPrice)}/month`);

    // Also update the UpgradePrompt component
    console.log('🔄 Updating UpgradePrompt component...');
    
    // This will be handled separately as it's a code change

  } catch (error) {
    console.error('❌ Error updating Pro plan pricing:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateProPlanPricing()
  .then(() => {
    console.log('🎉 Pro plan pricing update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to update Pro plan pricing:', error);
    process.exit(1);
  });