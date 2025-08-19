import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { availableModels } from '@/lib/ai-models';

// In-memory storage for AI model configurations (in production, use database)
let aiModelConfigs = new Map<string, any>();

// Initialize with default configurations
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const models = Array.from(aiModelConfigs.values());

    return NextResponse.json({ models });
  } catch (error) {
    console.error('AI Models API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { modelId, config } = body;

    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID is required' },
        { status: 400 }
      );
    }

    const existingModel = aiModelConfigs.get(modelId);
    if (!existingModel) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Update model configuration
    const updatedModel = {
      ...existingModel,
      ...config,
      lastUsed: config.status === 'active' ? new Date().toISOString() : existingModel.lastUsed
    };

    aiModelConfigs.set(modelId, updatedModel);

    return NextResponse.json({ model: updatedModel });
  } catch (error) {
    console.error('Update AI model error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}