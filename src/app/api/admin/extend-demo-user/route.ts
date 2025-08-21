import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    console.log('🔍 Searching for demo@pinegenie.com user...');
    
    // Find the demo user
    const demoUser = await prisma.user.findUnique({
      where: {
        email: 'demo@pinegenie.com'
      },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    });

    if (!demoUser) {
      console.log('❌ Demo user not found. Creating demo user...');
      
      // Create demo user if not exists
      const newDemoUser = await prisma.user.create({
        data: {
          email: 'demo@pinegenie.com',
          name: 'Demo User',
          password: '$2a$10$dummy.hash.for.demo.user', // Dummy hash
          role: 'USER'
        }
      });
      
      console.log('✅ Demo user created:', newDemoUser.id);
      
      // Create a subscription for the demo user
      const subscription = await createDemoSubscription(newDemoUser.id);
      await allocateTokensToDemo(newDemoUser.id);
      
      return NextResponse.json({
        success: true,
        message: 'Demo user created and subscription extended',
        user: {
          id: newDemoUser.id,
          email: newDemoUser.email,
          name: newDemoUser.name
        },
        subscription: {
          id: subscription.id,
          expiresAt: subscription.currentPeriodEnd
        }
      });
      
    } else {
      console.log('✅ Demo user found:', demoUser.id);
      console.log('📊 Current subscriptions:', demoUser.subscriptions.length);
      
      if (demoUser.subscriptions.length > 0) {
        // Extend existing subscription
        const subscription = demoUser.subscriptions[0];
        const newEndDate = new Date();
        newEndDate.setMonth(newEndDate.getMonth() + 6); // Extend by 6 months
        
        const updatedSubscription = await prisma.subscription.update({
          where: {
            id: subscription.id
          },
          data: {
            currentPeriodEnd: newEndDate,
            cancelAtPeriodEnd: false
          }
        });
        
        console.log('✅ Subscription extended until:', newEndDate.toISOString());
        
        // Also allocate more tokens
        await allocateTokensToDemo(demoUser.id);
        
        return NextResponse.json({
          success: true,
          message: 'Demo user subscription extended successfully',
          user: {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name
          },
          subscription: {
            id: updatedSubscription.id,
            expiresAt: updatedSubscription.currentPeriodEnd
          }
        });
        
      } else {
        // Create new subscription
        const subscription = await createDemoSubscription(demoUser.id);
        await allocateTokensToDemo(demoUser.id);
        
        return NextResponse.json({
          success: true,
          message: 'Demo user subscription created',
          user: {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name
          },
          subscription: {
            id: subscription.id,
            expiresAt: subscription.currentPeriodEnd
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ Error extending demo user subscription:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to extend demo user subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function createDemoSubscription(userId: string) {
  try {
    // Find or create a subscription plan
    let plan = await prisma.subscriptionPlan.findFirst({
      where: {
        name: 'pro'
      }
    });

    if (!plan) {
      // Create a pro plan if it doesn't exist
      plan = await prisma.subscriptionPlan.create({
        data: {
          name: 'pro',
          displayName: 'Pro Plan',
          description: 'Professional plan with advanced features',
          monthlyPrice: 29.99,
          annualPrice: 299.99,
          currency: 'USD',
          features: [
            'Unlimited AI conversations',
            'Advanced strategy builder',
            'Priority support',
            'Export capabilities'
          ],
          limits: {
            conversations: -1, // Unlimited
            strategies: -1,    // Unlimited
            exports: -1        // Unlimited
          },
          isActive: true
        }
      });
      
      console.log('✅ Pro plan created:', plan.id);
    }

    // Create subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6); // 6 months from now

    const subscription = await prisma.subscription.create({
      data: {
        userId: userId,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false
      }
    });

    console.log('✅ Demo subscription created:', subscription.id);
    console.log('📅 Valid until:', endDate.toISOString());
    
    return subscription;
    
  } catch (error) {
    console.error('❌ Error creating demo subscription:', error);
    throw error;
  }
}

async function allocateTokensToDemo(userId: string) {
  try {
    // Find admin user for allocation
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        isActive: true
      }
    });

    if (!adminUser) {
      console.log('⚠️ No admin user found for token allocation');
      return;
    }

    // Allocate 100,000 tokens for testing
    const tokenAllocation = await prisma.tokenAllocation.create({
      data: {
        userId: userId,
        tokenAmount: 100000,
        allocatedBy: adminUser.id,
        reason: 'Demo user testing allocation - Extended',
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
        isActive: true
      }
    });

    console.log('✅ Tokens allocated:', tokenAllocation.tokenAmount);
    console.log('📅 Tokens expire:', tokenAllocation.expiresAt);
    
  } catch (error) {
    console.error('❌ Error allocating tokens:', error);
  }
}