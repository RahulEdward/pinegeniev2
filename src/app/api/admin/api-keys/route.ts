import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { simpleApiKeys } from '@/lib/simple-api-keys';

export async function GET() {
  try {
    await requireAdmin();

    const apiKeys = simpleApiKeys.getAllKeys();
    const availableProviders = simpleApiKeys.getAvailableProviders();

    return NextResponse.json({
      apiKeys,
      availableProviders,
      encryptionStatus: 'working'
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const { provider, keyName, apiKey } = await request.json();

    if (!provider || !keyName || !apiKey) {
      return NextResponse.json(
        { error: 'Provider, key name, and API key are required' },
        { status: 400 }
      );
    }

    const newApiKey = simpleApiKeys.setApiKey(provider, keyName, apiKey);

    return NextResponse.json({
      apiKey: {
        id: newApiKey.id,
        provider: newApiKey.provider,
        keyName: newApiKey.keyName,
        maskedKey: '****-****-****-' + apiKey.slice(-4),
        isActive: newApiKey.isActive,
        createdAt: newApiKey.createdAt,
        usageCount: newApiKey.usageCount
      },
      message: 'API key saved successfully'
    });
  } catch (error) {
    console.error('Create API key error:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create API key' },
      { status: 500 }
    );
  }
}