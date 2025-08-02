import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const template = await prisma.strategyTemplate.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            strategies: true,
          }
        }
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const responseTemplate = {
      ...template,
      nodes: JSON.parse(template.nodes as string),
      connections: JSON.parse(template.connections as string),
      tags: template.tags ? JSON.parse(template.tags) : [],
    };

    return NextResponse.json({
      success: true,
      data: responseTemplate,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      category, 
      nodes, 
      connections, 
      tags, 
      difficulty 
    } = body;

    // Check if template exists
    const existingTemplate = await prisma.strategyTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Only allow editing non-official templates or if user is admin
    // For now, we'll prevent editing official templates
    if (existingTemplate.isOfficial) {
      return NextResponse.json(
        { error: 'Cannot edit official templates' },
        { status: 403 }
      );
    }

    // Validate name if provided
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Template name is required' },
          { status: 400 }
        );
      }

      // Check for duplicate names (excluding current template)
      const duplicateTemplate = await prisma.strategyTemplate.findFirst({
        where: {
          name: name.trim(),
          id: { not: params.id },
        },
      });

      if (duplicateTemplate) {
        return NextResponse.json(
          { error: 'A template with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Validate difficulty if provided
    if (difficulty !== undefined && !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Difficulty must be one of: beginner, intermediate, advanced' },
        { status: 400 }
      );
    }

    // Validate nodes and connections if provided
    if (nodes !== undefined && (!Array.isArray(nodes))) {
      return NextResponse.json(
        { error: 'Template nodes must be an array' },
        { status: 400 }
      );
    }

    if (connections !== undefined && (!Array.isArray(connections))) {
      return NextResponse.json(
        { error: 'Template connections must be an array' },
        { status: 400 }
      );
    }

    const template = await prisma.strategyTemplate.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(category !== undefined && { category: category?.trim() }),
        ...(nodes !== undefined && { nodes: JSON.stringify(nodes) }),
        ...(connections !== undefined && { connections: JSON.stringify(connections) }),
        ...(tags !== undefined && { tags: tags ? JSON.stringify(tags) : null }),
        ...(difficulty !== undefined && { difficulty }),
      },
    });

    // Parse the response data
    const responseTemplate = {
      ...template,
      nodes: JSON.parse(template.nodes as string),
      connections: JSON.parse(template.connections as string),
      tags: template.tags ? JSON.parse(template.tags) : [],
    };

    return NextResponse.json({
      success: true,
      data: responseTemplate,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if template exists
    const existingTemplate = await prisma.strategyTemplate.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            strategies: true,
          }
        }
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of official templates
    if (existingTemplate.isOfficial) {
      return NextResponse.json(
        { error: 'Cannot delete official templates' },
        { status: 403 }
      );
    }

    // Check if template is being used by strategies
    if (existingTemplate._count.strategies > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete template that is being used by strategies',
          details: {
            strategiesCount: existingTemplate._count.strategies,
          }
        },
        { status: 409 }
      );
    }

    await prisma.strategyTemplate.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}