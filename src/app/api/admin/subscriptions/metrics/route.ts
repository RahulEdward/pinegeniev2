/**
 * Subscription Metrics API
 * 
 * GET /api/admin/subscriptions/metrics - Get subscription analytics and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Calculate subscription metrics
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total revenue from all approved payments
    const totalRevenueResult = await prisma.payment.aggregate({
      where: {
        status: 'APPROVED'
      },
      _sum: {
        amount: true
      }
    });

    // Active subscriptions count
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] }
      }
    });

    // Monthly recurring revenue (current month)
    const monthlyRecurringResult = await prisma.payment.aggregate({
      where: {
        status: 'APPROVED',
        createdAt: {
          gte: startOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });

    // Calculate churn rate (subscriptions canceled last month / active subscriptions at start of last month)
    const canceledLastMonth = await prisma.subscription.count({
      where: {
        status: 'CANCELED',
        updatedAt: {
          gte: startOfLastMonth,
          lte: endOfLastMonth
        }
      }
    });

    const activeAtStartOfLastMonth = await prisma.subscription.count({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] },
        createdAt: {
          lt: startOfLastMonth
        }
      }
    });

    const churnRate = activeAtStartOfLastMonth > 0 
      ? (canceledLastMonth / activeAtStartOfLastMonth) * 100 
      : 0;

    // Average revenue per user
    const averageRevenuePerUser = activeSubscriptions > 0 
      ? Number(totalRevenueResult._sum.amount || 0) / activeSubscriptions 
      : 0;

    const metrics = {
      totalRevenue: Number(totalRevenueResult._sum.amount || 0),
      activeSubscriptions,
      monthlyRecurring: Number(monthlyRecurringResult._sum.amount || 0),
      churnRate,
      averageRevenuePerUser
    };

    return NextResponse.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('Error fetching subscription metrics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch subscription metrics'
      },
      { status: 500 }
    );
  }
}