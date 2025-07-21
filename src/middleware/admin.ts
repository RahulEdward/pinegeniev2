import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { AdminUserService, logSecurityEvent, logAdminAction } from '@/services/admin';
import { AdminUser } from '@prisma/client';

/**
 * Middleware to verify admin authentication
 */
export async function verifyAdminAuth(request: NextRequest): Promise<{
  isValid: boolean;
  adminId?: string;
  response?: NextResponse;
}> {
  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return {
        isValid: false,
        response: NextResponse.json(
          { success: false, message: 'No authentication token' },
          { status: 401 }
        ),
      };
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as { adminId: string; sessionId: string };
    
    // Get admin user from database
    const adminUser = await AdminUserService.findById(decoded.adminId);

    if (!adminUser || !adminUser.isActive || !adminUser.isAdmin) {
      return {
        isValid: false,
        response: NextResponse.json(
          { success: false, message: 'Invalid admin user' },
          { status: 401 }
        ),
      };
    }

    // Check if session is still valid
    if (adminUser.sessionId !== decoded.sessionId) {
      return {
        isValid: false,
        response: NextResponse.json(
          { success: false, message: 'Session expired' },
          { status: 401 }
        ),
      };
    }

    return {
      isValid: true,
      adminId: adminUser.id,
    };

  } catch (_error) {
    return {
      isValid: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Higher-order function to protect admin API routes
 */
export function withAdminAuth(handler: (request: NextRequest, adminId: string) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await verifyAdminAuth(request);
    
    if (!authResult.isValid) {
      return authResult.response!;
    }

    return handler(request, authResult.adminId!);
  };
}

/**
 * Enhanced admin authentication with security logging
 */
export async function verifyAdminAuthWithLogging(request: NextRequest): Promise<{
  isValid: boolean;
  adminId?: string;
  adminUser?: AdminUser;
  response?: NextResponse;
}> {
  const clientIP = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const path = request.nextUrl.pathname;

  try {
    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      // Log unauthorized access attempt
      await logSecurityEvent(
        'unauthorized_admin_access',
        'medium',
        `Unauthorized admin access attempt to ${path}`,
        { path, reason: 'no_token' },
        { ip: clientIP, userAgent }
      );

      return {
        isValid: false,
        response: NextResponse.json(
          { success: false, message: 'No authentication token' },
          { status: 401 }
        ),
      };
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as { adminId: string; sessionId: string };
    
    // Get admin user from database
    const adminUser = await AdminUserService.findById(decoded.adminId);

    if (!adminUser || !adminUser.isActive || !adminUser.isAdmin) {
      // Log invalid admin access attempt
      await logSecurityEvent(
        'invalid_admin_access',
        'high',
        `Invalid admin access attempt to ${path}`,
        { path, adminId: decoded.adminId, reason: 'invalid_user' },
        { ip: clientIP, userAgent }
      );

      return {
        isValid: false,
        response: NextResponse.json(
          { success: false, message: 'Invalid admin user' },
          { status: 401 }
        ),
      };
    }

    // Check if session is still valid
    if (adminUser.sessionId !== decoded.sessionId) {
      // Log session mismatch
      await logSecurityEvent(
        'admin_session_mismatch',
        'high',
        `Admin session mismatch for ${adminUser.email} accessing ${path}`,
        { path, adminId: adminUser.id, reason: 'session_expired' },
        { ip: clientIP, userAgent }
      );

      return {
        isValid: false,
        response: NextResponse.json(
          { success: false, message: 'Session expired' },
          { status: 401 }
        ),
      };
    }

    // Log successful admin access (for sensitive operations)
    if (path.includes('/api/admin/') && !path.includes('/metrics')) {
      await logAdminAction(
        adminUser.id,
        'API_ACCESS',
        'ADMIN_API',
        path,
        { path, method: request.method },
        { ip: clientIP, userAgent }
      );
    }

    return {
      isValid: true,
      adminId: adminUser.id,
      adminUser,
    };

  } catch (error) {
    // Log token verification error
    await logSecurityEvent(
      'admin_token_error',
      'high',
      `Admin token verification error for ${path}`,
      { path, error: error instanceof Error ? error.message : 'Unknown error' },
      { ip: clientIP, userAgent }
    );

    return {
      isValid: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      ),
    };
  }
}

/**
 * Enhanced higher-order function with comprehensive logging
 */
export function withAdminAuthAndLogging(
  handler: (request: NextRequest, adminId: string, adminUser: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await verifyAdminAuthWithLogging(request);
    
    if (!authResult.isValid) {
      return authResult.response!;
    }

    return handler(request, authResult.adminId!, authResult.adminUser!);
  };
}

/**
 * Rate limiting for admin API endpoints
 */
const adminRateLimits = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return function(handler: (request: NextRequest, adminId: string) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
      const authResult = await verifyAdminAuth(request);
      
      if (!authResult.isValid) {
        return authResult.response!;
      }

      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      const key = `${authResult.adminId}-${clientIP}`;
      const now = Date.now();
      
      const limit = adminRateLimits.get(key);
      
      if (limit) {
        if (now < limit.resetTime) {
          if (limit.count >= maxRequests) {
            // Log rate limit exceeded
            await logSecurityEvent(
              'admin_rate_limit_exceeded',
              'medium',
              `Admin rate limit exceeded for ${authResult.adminId}`,
              { adminId: authResult.adminId, requests: limit.count, limit: maxRequests },
              { ip: clientIP, userAgent: request.headers.get('user-agent') || 'unknown' }
            );

            return NextResponse.json(
              { success: false, message: 'Rate limit exceeded' },
              { status: 429 }
            );
          }
          limit.count++;
        } else {
          // Reset window
          adminRateLimits.set(key, { count: 1, resetTime: now + windowMs });
        }
      } else {
        adminRateLimits.set(key, { count: 1, resetTime: now + windowMs });
      }

      return handler(request, authResult.adminId!);
    };
  };
}

// AdminRoute component is now in src/components/admin/AdminRoute.tsx

/**
 * Single admin model enforcement - always returns true for authenticated admin
 */
export function hasFullAccess(): boolean {
  return true; // Single admin has unrestricted access
}

/**
 * Check if admin has access to specific resource (always true for single admin)
 */
export function hasResourceAccess(_resource: string): boolean {
  return true; // Single admin has access to all resources
}

/**
 * Validate admin session and update last activity
 */
export async function validateAndUpdateSession(adminId: string, request: NextRequest): Promise<boolean> {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Update last login IP if different
    const adminUser = await AdminUserService.findById(adminId);
    if (adminUser && adminUser.lastLoginIP !== clientIP) {
      await AdminUserService.update(adminId, { lastLoginIP: clientIP });
    }

    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

/**
 * Security headers for admin responses
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}