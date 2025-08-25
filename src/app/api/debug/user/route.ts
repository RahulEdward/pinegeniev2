import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@pinegenie.com' },
    });

    if (!adminUser) {
      return NextResponse.json({ 
        error: 'Admin user not found',
        suggestion: 'Run: npm run db:seed'
      });
    }

    // Test password comparison
    const isPasswordValid = await bcrypt.compare('admin123', adminUser.password);

    return NextResponse.json({
      userExists: !!adminUser,
      userEmail: adminUser.email,
      userName: adminUser.name,
      userRole: adminUser.role,
      passwordValid: isPasswordValid,
      passwordHash: adminUser.password.substring(0, 10) + '...',
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}