import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🌱 Starting database seeding...');

    // Create test user
    const testPassword = await bcrypt.hash('test123', 12);
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: testPassword,
        role: 'USER',
      },
    });

    console.log('✅ Created test user:', testUser.email);

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@pinegenie.com' },
      update: {},
      create: {
        email: 'admin@pinegenie.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Created admin user:', adminUser.email);

    // Create demo user
    const demoPassword = await bcrypt.hash('demo123', 12);
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@pinegenie.com' },
      update: {},
      create: {
        email: 'demo@pinegenie.com',
        name: 'Demo User',
        password: demoPassword,
        role: 'USER',
      },
    });

    console.log('✅ Created demo user:', demoUser.email);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully! 🎉',
      users: [
        { email: testUser.email, password: 'test123' },
        { email: adminUser.email, password: 'admin123' },
        { email: demoUser.email, password: 'demo123' }
      ],
      instructions: 'You can now login with any of these credentials!'
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database seeding failed'
    }, { status: 500 });

  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  // Same as GET for flexibility
  return GET(request);
}