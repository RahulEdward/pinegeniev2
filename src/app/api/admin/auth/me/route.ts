import { NextRequest, NextResponse } from 'next/server';
import { AdminUserService } from '@/services/admin';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No authentication token' },
        { status: 401 }
      );
    }

    try {
      // Verify and decode token
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as { adminId: string; sessionId: string };
      
      // Get admin user from database
      const adminUser = await AdminUserService.findById(decoded.adminId);

      if (!adminUser || !adminUser.isActive || !adminUser.isAdmin) {
        return NextResponse.json(
          { success: false, message: 'Invalid admin user' },
          { status: 401 }
        );
      }

      // Check if session is still valid
      if (adminUser.sessionId !== decoded.sessionId) {
        return NextResponse.json(
          { success: false, message: 'Session expired' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          isAdmin: adminUser.isAdmin,
          lastLogin: adminUser.lastLogin,
          mfaEnabled: adminUser.mfaEnabled,
          isActive: adminUser.isActive,
        },
      });

    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}