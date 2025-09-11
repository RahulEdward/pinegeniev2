/**
 * Debug Subscription API
 * Check subscription status for debugging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('🔍 Debug - User ID:', session.user.id);
    console.log('🔍 Debug - User Email:', session.user.email);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: {
            plan: true
          }
        }
      }
    });

    console.log('🔍 Debug - User found:', !!user);
    console.log('🔍 Debug - Active subscriptions:', user?.subscriptions?.length || 0);

    if (user?.subscriptions && user.subscriptions.length > 0) {
      const subscription = user.subscriptions[0];
      console.log('🔍 Debug - Subscription plan:', subscription.plan.name);
      console.log('🔍 Debug - Plan limits:', subscription.plan.limits);
    }

    return NextResponse.json({
      success: true,
      debug: {
        userId: session.user.id,
        userEmail: session.user.email,
        userFound: !!user,
        subscriptionsCount: user?.subscriptions?.length || 0,
        subscriptions: user?.subscriptions?.map(sub => ({
          id: sub.id,
          planName: sub.plan.name,
          planDisplayName: sub.plan.displayName,
          status: sub.status,
          limits: sub.plan.limits,
          currentPeriodEnd: sub.currentPeriodEnd
        })) || []
      }
    });

  } catch (error) {
    console.error('❌ Debug subscription error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}