/**
 * AI Chat Route Protection Middleware
 * 
 * Server-side protection for AI chat routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function aiChatProtection(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check if the route is AI chat related
  if (request.nextUrl.pathname.startsWith('/ai-chat')) {
    try {
      // Check subscription access
      const response = await fetch(`${request.nextUrl.origin}/api/subscription/check-access?feature=ai_chat`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!data.hasAccess) {
          // Redirect to billing page for upgrade
          return NextResponse.redirect(new URL('/billing?feature=ai_chat', request.url));
        }
      } else {
        // If API call fails, redirect to billing as a safe fallback
        return NextResponse.redirect(new URL('/billing?feature=ai_chat', request.url));
      }
    } catch (error) {
      console.error('Error checking AI chat access:', error);
      // On error, allow the request to proceed and let client-side handle it
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ai-chat/:path*']
};