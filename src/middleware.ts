import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes and public assets
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key'
  });
  
  const isAuthenticated = !!token;
  const isAuthPage = publicPaths.some(path => pathname.startsWith(path));

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (isAuthPage && isAuthenticated) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  // If user is not authenticated and tries to access protected pages, redirect to login
  if (!isAuthenticated && !isAuthPage) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
