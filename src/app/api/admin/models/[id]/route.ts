import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;
    const data = await request.json();

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.lLMModel.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const model = await prisma.lLMModel.update({
      where: { id },
      data,
    });

    return NextResponse.json(model);
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
    const { id } = params;

    // Check if model is default
    const model = await prisma.lLMModel.findUnique({
      where: { id },
    });

    if (model?.isDefault) {
      return NextResponse.json(
        { error: 'Cannot delete default model' },
        { status: 400 }
      );
    }

    await prisma.lLMModel.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
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