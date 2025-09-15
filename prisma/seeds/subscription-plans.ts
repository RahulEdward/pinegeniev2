// Load environment variables
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env files in order of precedence
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const subscriptionPlansData = [
  {
    id: 'free-plan',
    name: 'free',
    displayName: 'Free',
    description: 'Perfect for getting started with Pine Script',
    monthlyPrice: 0,
    annualPrice: 0,
    currency: 'INR',
    features: [
      {
        id: 'visual_builder',
        name: 'Visual Builder Access',
        description: 'Drag-and-drop Pine Script builder',
        included: true
      },
      {
        id: 'basic_templates',
        name: 'Basic Templates',
        description: 'Access to 3 basic strategy templates',
        included: true
      },
      {
        id: 'script_storage',
        name: 'Script Storage',
        description: 'Save up to 1 script',
        included: true,
        limit: 1
      },
      {
        id: 'pine_signature',
        name: 'Pine Genie Signature',
        description: 'Pine Genie branding in generated scripts',
        included: true
      },
      {
        id: 'ai_chat_access',
        name: 'Pine Genie AI Chat',
        description: 'AI-powered Pine Script assistance',
        included: false
      },
      {
        id: 'community_support',
        name: 'Community Support',
        description: 'Access to community forums',
        included: true
      }
    ],
    limits: {
      strategiesPerMonth: 1,
      templatesAccess: 'basic',
      aiGenerations: 0,
      aiChatAccess: false,
      scriptStorage: 1,
      exportFormats: ['pine'],
      supportLevel: 'community',
      customSignatures: false,
      apiAccess: false,
      whiteLabel: false,
      teamCollaboration: false,
      advancedIndicators: false,
      backtesting: false
    },
    isPopular: false,
    trialDays: 0,
    isActive: true
  },
  {
    id: 'pro-plan',
    name: 'pro',
    displayName: 'Pro',
    description: 'For serious traders who need advanced features',
    monthlyPrice: 2499,
    annualPrice: 24999,
    currency: 'INR',
    features: [
      {
        id: 'visual_builder',
        name: 'Visual Builder Access',
        description: 'Full drag-and-drop Pine Script builder',
        included: true
      },
      {
        id: 'ai_chat_access',
        name: 'Pine Genie AI Chat',
        description: 'Unlimited AI-powered Pine Script assistance',
        included: true
      },
      {
        id: 'all_templates',
        name: 'All Templates',
        description: 'Access to 50+ professional templates',
        included: true
      },
      {
        id: 'unlimited_strategies',
        name: 'Unlimited Scripts',
        description: 'Create and save unlimited scripts',
        included: true
      },
      {
        id: 'advanced_ai',
        name: 'Advanced AI Features',
        description: 'AI-powered strategy optimization',
        included: true
      },
      {
        id: 'custom_signatures',
        name: 'Custom Signatures',
        description: 'Customize script signatures',
        included: true
      },
      {
        id: 'export_formats',
        name: 'Multiple Export Formats',
        description: 'Export to Pine, JSON, and more',
        included: true
      },
      {
        id: 'advanced_indicators',
        name: 'Advanced Indicators',
        description: 'Access to premium indicators',
        included: true
      },
      {
        id: 'backtesting',
        name: 'Strategy Backtesting',
        description: 'Test strategies with historical data',
        included: true
      },
      {
        id: 'priority_support',
        name: 'Priority Support',
        description: 'Email support with 24h response',
        included: true
      }
    ],
    limits: {
      strategiesPerMonth: 'unlimited',
      templatesAccess: 'all',
      aiGenerations: 'unlimited',
      aiChatAccess: true,
      scriptStorage: 'unlimited',
      exportFormats: ['pine', 'json', 'txt'],
      supportLevel: 'priority',
      customSignatures: true,
      apiAccess: false,
      whiteLabel: false,
      teamCollaboration: false,
      advancedIndicators: true,
      backtesting: true
    },
    isPopular: true,
    trialDays: 14,
    isActive: true
  },
  {
    id: 'premium-plan',
    name: 'premium',
    displayName: 'Premium',
    description: 'For teams and organizations with advanced needs',
    monthlyPrice: 2998,
    annualPrice: 29980,
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
      aiGenerations: 'unlimited',
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
];

export async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...');
  
  for (const planData of subscriptionPlansData) {
    await prisma.subscriptionPlan.upsert({
      where: { name: planData.name },
      update: {
        displayName: planData.displayName,
        description: planData.description,
        monthlyPrice: planData.monthlyPrice,
        annualPrice: planData.annualPrice,
        currency: planData.currency,
        features: planData.features,
        limits: planData.limits,
        isPopular: planData.isPopular,
        trialDays: planData.trialDays,
        isActive: planData.isActive
      },
      create: planData
    });
    
    console.log(`✅ Created/Updated subscription plan: ${planData.displayName}`);
  }
  
  console.log('🎉 Subscription plans seeded successfully!');
}

if (require.main === module) {
  seedSubscriptionPlans()
    .catch((e) => {
      console.error('❌ Error seeding subscription plans:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}