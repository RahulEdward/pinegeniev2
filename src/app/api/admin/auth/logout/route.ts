import { NextRequest, NextResponse } from 'next/server';
import { logoutAdmin, logSecurityEvent } from '@/services/admin';
import jwt from 'jsonwebtoken';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (token) {
      try {
        // Decode token to get admin info
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as { adminId: string };
        
        // Clear admin session
        await logoutAdmin(decoded.adminId);

        // Log logout event
        const clientIP = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        await logSecurityEvent(
          'admin_logout',
          'low',
          `Admin logout: ${decoded.email}`,
          { adminId: decoded.adminId },
          { ip: clientIP, userAgent }
        );

      } catch (error) {
        console.error('Error during logout:', error);
      }
    }

    // Create response and clear cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}