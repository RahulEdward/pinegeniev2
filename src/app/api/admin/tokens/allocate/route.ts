/**
 * Admin Token Allocation API
 * 
 * POST /api/admin/tokens/allocate - Allocate tokens to a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin (you might want to add proper admin check here)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, tokenAmount } = body;

    // Validate input
    if (!userId || !tokenAmount || tokenAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid userId or tokenAmount' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get admin user (for audit trail)
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Create token allocation
    const allocation = await prisma.tokenAllocation.create({
      data: {
        userId: userId,
        tokenAmount: tokenAmount,
        allocatedBy: adminUser.id,
        reason: `Manual allocation by admin: ${adminUser.name || adminUser.email}`,
        expiresAt: null, // No expiration for manual allocations
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      allocation: {
        id: allocation.id,
        userId: allocation.userId,
        tokenAmount: allocation.tokenAmount,
        allocatedBy: allocation.allocatedBy,
        reason: allocation.reason,
        createdAt: allocation.createdAt
      }
    });

  } catch (error) {
    console.error('Error allocating tokens:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to allocate tokens'
      },
      { status: 500 }
    );
  }
}