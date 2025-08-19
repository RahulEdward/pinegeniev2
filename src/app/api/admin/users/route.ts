import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthAndLogging, addSecurityHeaders, withRateLimit } from '@/middleware/admin';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/services/admin';
import bcrypt from 'bcryptjs';

// Get users with pagination and filtering
export const GET = withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      // Add status filtering logic based on your user model
    }

    // Get users and total count
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
      }),
      prisma.user.count({ where }),
    ]);

    // Log admin action
    await logAdminAction(
      adminId,
      'VIEW_USERS',
      'USER_MANAGEMENT',
      undefined,
      { page, limit, search, totalCount },
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    const response = NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });

    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Admin users fetch error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
});

// Create or update user (with rate limiting)
export const POST = withRateLimit(20, 60000)(
  withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any) => {
    try {
      const body = await request.json();
      const { action, userId, userData } = body;

      let result;
      let actionType;

      switch (action) {
        case 'create':
          // Validate required fields
          if (!userData.name || !userData.email || !userData.password) {
            throw new Error('Name, email, and password are required');
          }

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
          });

          if (existingUser) {
            throw new Error('User with this email already exists');
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(userData.password, 12);

          result = await prisma.user.create({
            data: {
              name: userData.name,
              email: userData.email,
              password: hashedPassword,
              role: userData.role || 'USER',
              emailVerified: new Date(), // Auto-verify admin-created users
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              emailVerified: true,
            },
          });
          actionType = 'CREATE_USER';
          break;

        case 'update':
          if (!userId) {
            throw new Error('User ID required for update');
          }
          result = await prisma.user.update({
            where: { id: userId },
            data: userData,
          });
          actionType = 'UPDATE_USER';
          break;

        case 'suspend':
          if (!userId) {
            throw new Error('User ID required for suspension');
          }
          // Implement user suspension logic
          result = await prisma.user.update({
            where: { id: userId },
            data: { 
              // Add suspension fields to your user model
              // suspendedAt: new Date(),
              // suspendedBy: adminId,
            },
          });
          actionType = 'SUSPEND_USER';
          break;

        case 'activate':
          if (!userId) {
            throw new Error('User ID required for activation');
          }
          result = await prisma.user.update({
            where: { id: userId },
            data: { 
              // Clear suspension fields
              // suspendedAt: null,
              // suspendedBy: null,
            },
          });
          actionType = 'ACTIVATE_USER';
          break;

        case 'delete':
          if (!userId) {
            throw new Error('User ID required for deletion');
          }
          
          // First, delete related conversations to avoid foreign key constraints
          await prisma.conversation.deleteMany({
            where: { userId: userId },
          });
          
          // Then delete the user
          result = await prisma.user.delete({
            where: { id: userId },
          });
          actionType = 'DELETE_USER';
          break;

        case 'view_details':
          if (!userId) {
            throw new Error('User ID required for viewing details');
          }
          result = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              conversations: {
                select: {
                  id: true,
                  title: true,
                  createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
              },
            },
          });
          actionType = 'VIEW_USER_DETAILS';
          break;

        default:
          throw new Error('Invalid action');
      }

      // Log admin action
      await logAdminAction(
        adminId,
        actionType,
        'USER_MANAGEMENT',
        userId || result.id,
        { action, userData: action === 'create' ? undefined : userData },
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      );

      const response = NextResponse.json({
        success: true,
        data: result,
        message: `User ${action}d successfully`,
      });

      return addSecurityHeaders(response);

    } catch (error) {
      console.error('Admin user action error:', error);
      const response = NextResponse.json(
        { 
          success: false, 
          message: error instanceof Error ? error.message : 'User action failed' 
        },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }
  })
);