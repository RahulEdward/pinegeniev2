import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { availableModels } from '@/lib/ai-models';

// In-memory storage for AI model configurations (in production, use database)
let aiModelConfigs = new Map<string, any>();

// Initialize with default configurations if empty
if (aiModelConfigs.size === 0) {
  availableModels.forEach(model => {
    aiModelConfigs.set(model.id, {
      id: model.id,
      name: model.name,
      provider: model.provider,
      status: model.id === 'pine-genie' ? 'active' : 'inactive',
      usage: {
        requests: Math.floor(Math.random() * 1000) + 100,
        tokens: Math.floor(Math.random() * 100000) + 10000,
        cost: Math.floor(Math.random() * 50) + 10
      },
      limits: {
        requestsPerHour: 1000,
        tokensPerDay: 100000,
        maxCostPerDay: 100
      },
      lastUsed: model.id === 'pine-genie' ? new Date().toISOString() : null,
      tier: model.tier,
      description: model.description,
      maxTokens: model.maxTokens,
      costPer1k: model.costPer1k
    });
  });
}


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const model = aiModelConfigs.get(params.id);
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ model });
  } catch (error) {
    console.error('Get AI model error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const model = aiModelConfigs.get(params.id);
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Update model configuration
    const updatedModel = {
      ...model,
      ...body,
      lastUsed: body.status === 'active' ? new Date().toISOString() : model.lastUsed
    };

    aiModelConfigs.set(params.id, updatedModel);

    return NextResponse.json({ model: updatedModel });
  } catch (error) {
    console.error('Update AI model error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const model = aiModelConfigs.get(params.id);
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Don't allow deletion of core models
    if (model.id === 'pine-genie') {
      return NextResponse.json(
        { error: 'Cannot delete core model' },
        { status: 400 }
      );
    }

    aiModelConfigs.delete(params.id);

    return NextResponse.json({ message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Delete AI model error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}