<w> [webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: ENOENT: no 
such file or directory, rename 'C:\Users\USER\OneDrive\Desktop\pinegeniev\.next\cache\webpack\server-development\5.pack.gz_' -> 'C:\Users\USER\OneDrive\Desktop\pinegeniev\.next\cache\webpack\server-development\5.pack.gz'
    const {PrismaClient} = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    require('dotenv').config({path: '.env.local' });

    const prisma = new PrismaClient();

    async function createProUser() {
    try {
        console.log('🚀 Creating Pro User Account...');

    // First, let's check if subscription plans exist
    const plans = await prisma.subscriptionPlan.findMany();
        console.log('📋 Available subscription plans:', plans.map(p => ({name: p.name, displayName: p.displayName })));

    // Find or create Pro plan
    let proPlan = await prisma.subscriptionPlan.findFirst({
        where: {name: 'pro' }
        });

    if (!proPlan) {
        console.log('📦 Creating Pro subscription plan...');
    proPlan = await prisma.subscriptionPlan.create({
        data: {
        name: 'pro',
    displayName: 'Pro Plan',
    description: 'Professional plan with advanced features',
    monthlyPrice: 29.99,
    annualPrice: 299.99,
    currency: 'USD',
    features: [
    {
        id: 'unlimited_strategies',
    name: 'Unlimited Strategies',
    description: 'Create unlimited trading strategies',
    included: true,
    highlight: true
                        },
    {
        id: 'all_templates',
    name: 'All Templates',
    description: 'Access to all strategy templates',
    included: true,
    highlight: true
                        },
    {
        id: 'ai_chat',
    name: 'AI Chat Support',
    description: 'Advanced AI-powered chat assistance',
    included: true,
    highlight: true
                        },
    {
        id: 'priority_support',
    name: 'Priority Support',
    description: '24/7 priority customer support',
    included: true,
    highlight: false
                        }
    ],
    limits: {
        strategiesPerMonth: 'unlimited',
    templatesAccess: 'all',
    aiGenerations: 1000,
    aiChatAccess: true,
    scriptStorage: 'unlimited',
    exportFormats: ['pine', 'json', 'pdf'],
    supportLevel: 'priority',
    customSignatures: true,
    apiAccess: true,
    whiteLabel: false,
    teamCollaboration: true,
    advancedIndicators: true,
    backtesting: true
                    },
    isPopular: true,
    isActive: true,
    trialDays: 14
                }
            });
    console.log('✅ Pro plan created successfully');
        } else {
        console.log('✅ Pro plan already exists');
        }

    // Create Pro user credentials
    const proUserEmail = 'pro@pinegenietest.com';
    const proUserPassword = 'ProUser123!';
    const hashedPassword = await bcrypt.hash(proUserPassword, 12);

    console.log('🔑 Password being hashed:', proUserPassword);
    console.log('🔐 Generated hash:', hashedPassword);

    // Check if user already exists
    let proUser = await prisma.user.findUnique({
        where: {email: proUserEmail }
        });

    if (proUser) {
        console.log('👤 Pro user already exists, updating password...');
    // Update existing user with new password hash
    proUser = await prisma.user.update({
        where: {id: proUser.id },
    data: {
        name: 'Pro Test User',
    password: hashedPassword,
    role: 'USER',
    emailVerified: new Date()
                }
            });
    console.log('✅ Pro user password updated successfully');
        } else {
        console.log('👤 Creating new Pro user...');
    // Create new user
    proUser = await prisma.user.create({
        data: {
        name: 'Pro Test User',
    email: proUserEmail,
    password: hashedPassword,
    role: 'USER',
    emailVerified: new Date()
                }
            });
        }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
        where: {
        userId: proUser.id,
    status: 'ACTIVE'
            }
        });

    if (existingSubscription) {
        console.log('💳 Updating existing subscription to Pro plan...');
    await prisma.subscription.update({
        where: {id: existingSubscription.id },
    data: {
        planId: proPlan.id,
    status: 'ACTIVE',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    cancelAtPeriodEnd: false
                }
            });
        } else {
        console.log('💳 Creating Pro subscription for user...');
    await prisma.subscription.create({
        data: {
        userId: proUser.id,
    planId: proPlan.id,
    status: 'ACTIVE',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    cancelAtPeriodEnd: false
                }
            });
        }

    // Create some token allocations for the pro user
    console.log('🪙 Allocating tokens to Pro user...');

    // First, deactivate any existing token allocations
    await prisma.tokenAllocation.updateMany({
        where: {
        userId: proUser.id,
    isActive: true
            },
    data: {
        isActive: false
            }
        });

    // Create new token allocation with correct Pro plan amount
    await prisma.tokenAllocation.create({
        data: {
        userId: proUser.id,
    tokenAmount: 500,
    allocatedBy: 'system',
    reason: 'Pro plan initial allocation (500 tokens)',
    isActive: true
            }
        });

    console.log('\n🎉 Pro User Account Created Successfully!');
    console.log('📧 Email:', proUserEmail);
    console.log('🔑 Password:', proUserPassword);
    console.log('💎 Plan: Pro');
    console.log('🪙 Tokens: 500');
    console.log('\n🔗 Login URL: http://localhost:3000/login');
    console.log('\n⚠️  Note: Save these credentials safely!');

    } catch (error) {
        console.error('❌ Error creating Pro user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

    createProUser();