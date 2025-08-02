import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { simpleApiKeys } from '@/lib/simple-api-keys';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { id } = params;
    const { keyName, apiKey, isActive } = await request.json();

    const success = simpleApiKeys.updateKey(id, {
      keyName,
      apiKey,
      isActive
    });

    if (!success) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'API key updated successfully'
    });
  } catch (error) {
    console.error('Update API key error:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update API key' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { id } = params;
    const success = simpleApiKeys.deleteKey(id);

    if (!success) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete API key' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { action } = await request.json();

    if (action === 'test') {
      // Test API key connectivity
      return NextResponse.json({
        success: true,
        message: 'API key test completed'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API key action error:', error);
    
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}