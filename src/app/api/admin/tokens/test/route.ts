import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthAndLogging, addSecurityHeaders } from '@/middleware/admin';
import { prisma } from '@/lib/prisma';

// GET /api/admin/tokens/test - Test endpoint to verify token management APIs
export const GET = withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any) => {
  try {
    // Test database connectivity and basic queries
    const [userCount, tokenAllocationCount, tokenUsageCount] = await Promise.all([
      prisma.user.count(),
      prisma.tokenAllocation.count(),
      prisma.tokenUsageLog.count()
    ]);

    const testResults = {
      database: {
        connected: true,
        userCount,
        tokenAllocationCount,
        tokenUsageCount
      },
      endpoints: {
        overview: '/api/admin/tokens',
        users: '/api/admin/tokens/users',
        allocate: '/api/admin/tokens/allocate',
        userDetails: '/api/admin/tokens/users/[userId]'
      },
      authentication: {
        adminId,
        adminEmail: adminUser.email,
        authenticated: true
      },
      timestamp: new Date().toISOString()
    };

    const response = NextResponse.json({
      success: true,
      message: 'Token Management API endpoints are ready',
      data: testResults,
    });

    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Token API test error:', error);
    const response = NextResponse.json(
      { 
        success: false, 
        message: 'Token API test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
});