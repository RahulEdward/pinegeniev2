import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware for protecting admin routes
 * This runs at the edge before the request reaches the API routes or pages
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public admin routes
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login/') ||
    pathname.startsWith('/admin/login-test') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/admin/auth/login') ||
    pathname.startsWith('/api/admin/auth/logout') ||
    pathname.startsWith('/api/admin/auth/me') ||
    pathname.includes('.') // Skip static files
  ) {
    return NextResponse.next();
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin-token')?.value;
    
    console.log('🔍 Middleware check for:', pathname);
    console.log('🍪 Token present:', !!token);
    console.log('🍪 Token value:', token ? 'exists' : 'missing');

    if (!token) {
      console.log('❌ No token found, redirecting to login');
      // Redirect to login for admin pages
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      
      // Return 401 for API routes
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // For middleware, we'll do basic token presence check
    // Detailed JWT verification happens in API routes
    console.log('✅ Token found, allowing access');
    
    // Add admin context to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-token', token);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all admin routes and API routes
     * - /admin/:path*
     * - /api/admin/:path*
     */
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};