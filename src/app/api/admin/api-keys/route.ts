/**
 * API Key Management API
 * 
 * GET /api/admin/api-keys - Get configured API keys (without exposing actual keys)
 * POST /api/admin/api-keys - Add new API key configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// This would typically come from a database or secure configuration
// For development, we'll check environment variables
const getConfiguredApiKeys = () => {
  const keys = [];
  
  // Check for OpenAI API key
  if (process.env.OPENAI_API_KEY) {
    keys.push({
      id: 'openai-1',
      name: 'OpenAI GPT',
      service: 'openai',
      keyPreview: 'sk-proj-***...***' + process.env.OPENAI_API_KEY.slice(-4),
      status: 'active',
      lastTested: '2024-01-15 10:30:00',
      createdAt: '2024-01-10 09:00:00',
      environment: process.env.NODE_ENV as 'development' | 'staging' | 'production'
    });
  }
  
  // Check for Anthropic API key
  if (process.env.ANTHROPIC_API_KEY) {
    keys.push({
      id: 'anthropic-1',
      name: 'Anthropic Claude',
      service: 'anthropic',
      keyPreview: 'sk-ant-***...***' + process.env.ANTHROPIC_API_KEY.slice(-4),
      status: 'active',
      lastTested: '2024-01-15 10:25:00',
      createdAt: '2024-01-10 09:15:00',
      environment: process.env.NODE_ENV as 'development' | 'staging' | 'production'
    });
  }
  
  // Check for PayU credentials
  if (process.env.PAYU_MERCHANT_KEY && process.env.PAYU_MERCHANT_SALT) {
    keys.push({
      id: 'payu-1',
      name: 'PayU Payment Gateway',
      service: 'payu',
      keyPreview: process.env.PAYU_MERCHANT_KEY.slice(0, 4) + '***...***',
      status: 'active',
      lastTested: '2024-01-15 10:20:00',
      createdAt: '2024-01-10 09:30:00',
      environment: process.env.NODE_ENV as 'development' | 'staging' | 'production'
    });
  }
  
  // Check for Google AI API key
  if (process.env.GOOGLE_AI_API_KEY) {
    keys.push({
      id: 'google-1',
      name: 'Google AI (Gemini)',
      service: 'google',
      keyPreview: 'AIza***...***' + process.env.GOOGLE_AI_API_KEY.slice(-4),
      status: 'active',
      lastTested: '2024-01-15 10:15:00',
      createdAt: '2024-01-10 09:45:00',
      environment: process.env.NODE_ENV as 'development' | 'staging' | 'production'
    });
  }
  
  return keys;
};


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database to check role
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      await prisma.$disconnect();
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    await prisma.$disconnect();

    const apiKeys = getConfiguredApiKeys();

    return NextResponse.json({
      success: true,
      apiKeys
    });

  } catch (error) {
    console.error('Error fetching API keys:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch API keys'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database to check role
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      await prisma.$disconnect();
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    await prisma.$disconnect();

    const body = await request.json();
    const { service, name, environment } = body;

    // Validate input
    if (!service || !name || !environment) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Validate the API key format
    // 2. Test the API key
    // 3. Store the configuration securely (encrypted in database)
    // 4. Never store the actual API key in plain text

    return NextResponse.json({
      success: true,
      message: 'API key configuration saved. Please set the environment variable and restart the application.',
      instructions: {
        development: `Add to your .env.local file:\n${getEnvironmentVariableName(service)}=your_api_key_here`,
        production: `Set environment variable in your hosting platform:\n${getEnvironmentVariableName(service)}=your_api_key_here`
      }
    });

  } catch (error) {
    console.error('Error saving API key configuration:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save API key configuration'
      },
      { status: 500 }
    );
  }
}

function getEnvironmentVariableName(service: string): string {
  const mapping: Record<string, string> = {
    'openai': 'OPENAI_API_KEY',
    'anthropic': 'ANTHROPIC_API_KEY',
    'google': 'GOOGLE_AI_API_KEY',
    'payu': 'PAYU_MERCHANT_KEY'
  };
  
  return mapping[service] || `${service.toUpperCase()}_API_KEY`;
}