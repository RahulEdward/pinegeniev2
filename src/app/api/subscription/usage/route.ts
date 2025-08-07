/**
 * Subscription Usage API
 * 
 * Endpoint for fetching user's current subscription usage data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get current month start for AI usage calculation
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    // Fetch user's current usage data
    const [strategiesCount, aiUsageCount] = await Promise.all([
      // Count user's strategies
      prisma.strategy.count({
        where: {
          userId: userId
        }
      }),
      
      // Count AI usage this month (placeholder - implement when AI usage tracking is added)
      Promise.resolve(0) // TODO: Implement AI usage tracking
    ]);

    // Get templates used (placeholder - implement when template usage tracking is added)
    const templatesUsed: string[] = []; // TODO: Implement template usage tracking

    const usage = {
      strategiesCount,
      aiUsageThisMonth: aiUsageCount,
      templatesUsed,
      lastUpdated: new Date()
    };

    return NextResponse.json({
      success: true,
      usage
    });

  } catch (error) {
    console.error('Error fetching subscription usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}