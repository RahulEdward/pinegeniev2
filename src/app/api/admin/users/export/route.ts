
// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthAndLogging, addSecurityHeaders } from '@/middleware/admin';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/services/admin';

// Export users as CSV
export const GET = withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any) => {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        emailVerified: true,
        _count: {
          select: {
            conversations: true,
            strategies: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Create CSV content
    const csvHeaders = [
      'ID',
      'Name',
      'Email',
      'Role',
      'Email Verified',
      'Conversations Count',
      'Strategies Count',
      'Created At',
      'Updated At'
    ];

    const csvRows = users.map(user => [
      user.id,
      user.name || '',
      user.email || '',
      user.role,
      user.emailVerified ? 'Yes' : 'No',
      user._count.conversations.toString(),
      user._count.strategies.toString(),
      user.createdAt.toISOString(),
      user.updatedAt.toISOString()
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Log admin action
    await logAdminAction(
      adminId,
      'EXPORT_USERS',
      'USER_MANAGEMENT',
      undefined,
      { totalUsers: users.length },
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Users export error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Failed to export users' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
});