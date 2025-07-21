import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthAndLogging, addSecurityHeaders } from '@/middleware/admin';
import { prisma } from '@/lib/prisma';

export const GET = withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status === 'verified') {
      where.emailVerified = { not: null };
    } else if (status === 'unverified') {
      where.emailVerified = null;
    }

    // Get users
    const users = await prisma.user.findMany({
      where,
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Convert to CSV
    const headers = [
      'ID',
      'Name',
      'Email',
      'Role',
      'Email Verified',
      'Conversations',
      'Created At',
      'Updated At',
    ];

    const rows = users.map(user => [
      user.id,
      user.name || '',
      user.email || '',
      user.role,
      user.emailVerified ? 'Yes' : 'No',
      user._count.conversations.toString(),
      new Date(user.createdAt).toISOString(),
      new Date(user.updatedAt).toISOString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\\n');

    // Log admin action
    await prisma.auditLog.create({
      data: {
        adminId,
        action: 'EXPORT_USERS',
        resource: 'USER',
        details: { count: users.length },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    });

    // Return CSV
    const response = new NextResponse(csv, {
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