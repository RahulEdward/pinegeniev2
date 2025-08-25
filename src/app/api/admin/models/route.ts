import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { availableModels } from '@/lib/ai-models';

import fs from 'fs';
import path from 'path';

// File-based storage for model status (persists between server restarts)
const MODEL_STATUS_FILE = path.join(process.cwd(), '.kiro', 'model-status.json');

// Ensure .kiro directory exists
const kiroDir = path.join(process.cwd(), '.kiro');
if (!fs.existsSync(kiroDir)) {
  fs.mkdirSync(kiroDir, { recursive: true });
}

function loadModelStatus(): Map<string, { isActive: boolean; isDefault: boolean }> {
  try {
    if (fs.existsSync(MODEL_STATUS_FILE)) {
      const data = fs.readFileSync(MODEL_STATUS_FILE, 'utf8');
      const statusObj = JSON.parse(data);
      return new Map(Object.entries(statusObj));
    }
  } catch (error) {
    console.error('Error loading model status:', error);
  }
  
  // Initialize with default status if file doesn't exist
  const defaultStatus = new Map<string, { isActive: boolean; isDefault: boolean }>();
  availableModels.forEach((model) => {
    defaultStatus.set(model.id, {
      isActive: model.id === 'pine-genie', // Pine Genie is active by default
      isDefault: model.id === 'pine-genie' // Pine Genie is default
    });
  });
  
  saveModelStatus(defaultStatus);
  return defaultStatus;
}

function saveModelStatus(modelStatus: Map<string, { isActive: boolean; isDefault: boolean }>) {
  try {
    const statusObj = Object.fromEntries(modelStatus);
    fs.writeFileSync(MODEL_STATUS_FILE, JSON.stringify(statusObj, null, 2));
  } catch (error) {
    console.error('Error saving model status:', error);
  }
}

let modelStatus = loadModelStatus();


// Force dynamic rendering
export const dynamic = 'force-dynamic';

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