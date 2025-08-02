import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { availableModels } from '@/lib/ai-models';

// In-memory storage for model status (in production, use database)
let modelStatus = new Map<string, { isActive: boolean; isDefault: boolean }>();

// Initialize with default status
if (modelStatus.size === 0) {
  availableModels.forEach((model, index) => {
    modelStatus.set(model.id, {
      isActive: model.id === 'pine-genie', // Pine Genie is active by default
      isDefault: model.id === 'pine-genie' // Pine Genie is default
    });
  });
}

export async function GET() {
  try {
    await requireAdmin();

    // Convert your real models to the admin format
    const models = availableModels.map(model => {
      const status = modelStatus.get(model.id) || { isActive: false, isDefault: false };
      
      return {
        id: model.id,
        name: model.id,
        provider: model.provider,
        modelId: model.id,
        displayName: model.name,
        description: model.description,
        isActive: status.isActive,
        isDefault: status.isDefault,
        maxTokens: model.maxTokens,
        costPer1kTokens: model.costPer1k,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    return NextResponse.json(models);
  } catch (error) {
    console.error('Get Models Error:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    return NextResponse.json(
      { error: 'Adding custom models not supported. Models are managed in src/lib/ai-models.ts' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Create Model Error:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
}