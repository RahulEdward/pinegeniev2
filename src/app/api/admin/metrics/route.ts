import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthAndLogging, addSecurityHeaders } from '@/middleware/admin';
import { prisma } from '@/lib/prisma';

export const GET = withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any) => {

  try {
    // Fetch dashboard metrics
    const [
      totalUsers,
      totalModels,
      totalConversations,
      activeModels
    ] = await Promise.all([
      prisma.user.count(),
      prisma.lLMModel.count(),
      prisma.conversation.count(),
      prisma.lLMModel.count({ where: { isActive: true } })
    ]);

    const response = NextResponse.json({
      totalUsers,
      totalModels,
      totalConversations,
      activeModels,
    });

    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Admin metrics error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Failed to fetch metrics' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
});