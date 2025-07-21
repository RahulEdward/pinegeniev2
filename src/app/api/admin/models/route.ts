import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();

    const models = await prisma.lLMModel.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
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

    const {
      name,
      provider,
      modelId,
      displayName,
      description,
      isActive,
      isDefault,
      maxTokens,
      costPer1kTokens,
    } = await request.json();

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.lLMModel.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const model = await prisma.lLMModel.create({
      data: {
        name,
        provider,
        modelId,
        displayName,
        description,
        isActive: isActive ?? true,
        isDefault: isDefault ?? false,
        maxTokens,
        costPer1kTokens,
      },
    });

    return NextResponse.json(model);
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