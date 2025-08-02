import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(
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
      folderId, 
      customizations = {} 
    } = body;

    // Get the template
    const template = await prisma.strategyTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Parse template data
    const templateNodes = JSON.parse(template.nodes as string);
    const templateConnections = JSON.parse(template.connections as string);
    const templateTags = template.tags ? JSON.parse(template.tags) : [];

    // Generate unique strategy name if not provided
    let strategyName = name || `${template.name} Strategy`;
    if (!name) {
      let counter = 1;
      while (true) {
        const existing = await prisma.strategy.findFirst({
          where: {
            userId: session.user.id,
            name: strategyName,
          },
        });

        if (!existing) {
          break;
        }

        strategyName = `${template.name} Strategy (${counter})`;
        counter++;
      }
    }

    // Validate folder ownership if folderId is provided
    if (folderId) {
      const folder = await prisma.strategyFolder.findFirst({
        where: {
          id: folderId,
          userId: session.user.id,
        },
      });

      if (!folder) {
        return NextResponse.json(
          { error: 'Folder not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Apply customizations to nodes if provided
    let customizedNodes = templateNodes;
    let customizedConnections = templateConnections;

    if (customizations.nodeParameters) {
      customizedNodes = templateNodes.map((node: any) => {
        const nodeCustomizations = customizations.nodeParameters[node.id];
        if (nodeCustomizations) {
          return {
            ...node,
            config: {
              ...node.config,
              ...nodeCustomizations,
            },
          };
        }
        return node;
      });
    }

    // Create the strategy from template
    const strategy = await prisma.strategy.create({
      data: {
        userId: session.user.id,
        name: strategyName,
        description: description || `Strategy created from ${template.name} template`,
        category: template.category,
        nodes: JSON.stringify(customizedNodes),
        connections: JSON.stringify(customizedConnections),
        isPublic: false,
        tags: JSON.stringify([...templateTags, 'from-template']),
        folderId: folderId || null,
        templateId: template.id,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            category: true,
            difficulty: true,
          }
        },
      },
    });

    // Create initial version
    await prisma.strategyVersion.create({
      data: {
        strategyId: strategy.id,
        version: 1,
        name: strategy.name,
        description: strategy.description,
        nodes: strategy.nodes,
        connections: strategy.connections,
        changeLog: `Initial version created from template: ${template.name}`,
      },
    });

    // Parse the response data
    const responseStrategy = {
      ...strategy,
      nodes: JSON.parse(strategy.nodes as string),
      connections: JSON.parse(strategy.connections as string),
      tags: strategy.tags ? JSON.parse(strategy.tags) : [],
    };

    return NextResponse.json({
      success: true,
      data: responseStrategy,
      message: `Strategy created successfully from template: ${template.name}`,
    });
  } catch (error) {
    console.error('Error creating strategy from template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}