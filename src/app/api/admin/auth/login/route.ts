import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, logSecurityEvent } from '@/services/admin';
import { AdminCredentials } from '@/types/admin';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  console.log('🔐 Admin login API called');
  
  try {
    const body: AdminCredentials = await request.json();
    const { email, password, mfaCode } = body;
    
    console.log('📝 Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get client IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      console.log('🔍 Authenticating admin...');
      // Authenticate admin
      const adminUser = await authenticateAdmin({ email, password, mfaCode });
      console.log('👤 Authentication result:', adminUser ? 'Success' : 'Failed');

      if (!adminUser) {
        // Log failed login attempt
        await logSecurityEvent(
          'failed_login',
          'medium',
          `Failed admin login attempt for email: ${email}`,
          { email, reason: 'invalid_credentials' },
          { ip: clientIP, userAgent }
        );

        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Create JWT token
      console.log('🎫 Creating JWT token...');
      const token = jwt.sign(
        { 
          adminId: adminUser.id,
          email: adminUser.email,
          sessionId: adminUser.sessionId,
        },
        process.env.NEXTAUTH_SECRET || 'fallback-secret',
        { expiresIn: '24h' }
      );
      console.log('✅ JWT token created');

      // Create response with cookie
      const response = NextResponse.json({
        success: true,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          isAdmin: adminUser.isAdmin,
          lastLogin: adminUser.lastLogin,
          mfaEnabled: adminUser.mfaEnabled,
        },
      });

      // Set secure cookie
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      });

      // Log successful login
      await logSecurityEvent(
        'admin_login',
        'low',
        `Admin login successful for: ${adminUser.email}`,
        { adminId: adminUser.id },
        { ip: clientIP, userAgent }
      );

      return response;

    } catch (error: unknown) {
      // Log security event for authentication errors
      await logSecurityEvent(
        'admin_auth_error',
        'high',
        `Admin authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { email, error: error instanceof Error ? error.message : 'Unknown error' },
        { ip: clientIP, userAgent }
      );

      if (error.message.includes('locked')) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 423 } // Locked
        );
      }

      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('❌ Admin login error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}