import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
      NODE_ENV: process.env.NODE_ENV,
    };

    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@pinegenie.com' },
      select: { id: true, email: true, name: true, role: true }
    });

    return NextResponse.json({
      status: 'OK',
      database: {
        connected: true,
        userCount,
      },
      environment: envCheck,
      adminUser: adminUser ? {
        exists: true,
        email: adminUser.email,
        role: adminUser.role,
      } : {
        exists: false,
        message: 'Run: npm run db:seed'
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('System check error:', error);
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}