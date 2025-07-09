import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public paths that don't require authentication
const publicPaths = ['/login', '/register'];
const publicRootPath = '/'; // Handle root path separately

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API & asset routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  });

  const isAuthenticated = !!token;
  
  // Check if current path is a public path (excluding root)
  const isAuthPage = publicPaths.includes(pathname);
  const isRootPath = pathname === publicRootPath;

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow access to root path for everyone (landing page)
  if (isRootPath) {
    return NextResponse.next();
  }

  // If user is not authenticated and tries to access protected pages, redirect to login
  if (!isAuthenticated && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};