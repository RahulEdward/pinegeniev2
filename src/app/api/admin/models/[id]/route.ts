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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;
    const data = await request.json();

    // Check if model exists in our available models
    const model = availableModels.find(m => m.id === id);
    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Get current status
    const currentStatus = modelStatus.get(id) || { isActive: false, isDefault: false };

    // If setting as default, unset other defaults
    if (data.isDefault) {
      modelStatus.forEach((status, modelId) => {
        if (modelId !== id) {
          status.isDefault = false;
        }
      });
    }

    // Update status
    const newStatus = {
      isActive: data.isActive !== undefined ? data.isActive : currentStatus.isActive,
      isDefault: data.isDefault !== undefined ? data.isDefault : currentStatus.isDefault
    };

    modelStatus.set(id, newStatus);

    // Return updated model
    const updatedModel = {
      id: model.id,
      name: model.id,
      provider: model.provider,
      modelId: model.id,
      displayName: model.name,
      description: model.description,
      isActive: newStatus.isActive,
      isDefault: newStatus.isDefault,
      maxTokens: model.maxTokens,
      costPer1kTokens: model.costPer1k,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(updatedModel);
  } catch (error) {
    console.error('Update Model Error:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    return NextResponse.json(
      { error: 'Cannot delete predefined models. Models are managed in src/lib/ai-models.ts' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete Model Error:', error);
    
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    if (error instanceof Error && error.message.includes('authentication')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    );
  }
}