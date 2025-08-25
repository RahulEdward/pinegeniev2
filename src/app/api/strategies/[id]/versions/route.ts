import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

    // Check if user has access to the strategy
    const strategy = await prisma.strategy.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id }, // User's own strategy
          { isPublic: true }, // Public strategy
          {
            sharedStrategies: {
              some: {
                sharedWith: session.user.id,
              }
            }
          }, // Shared with user
        ],
      },
    });

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found or access denied' },
        { status: 404 }
      );
    }

    const versions = await prisma.strategyVersion.findMany({
      where: {
        strategyId: params.id,
      },
      orderBy: {
        version: 'desc',
      },
    });

    // Parse JSON fields
    const responseVersions = versions.map(version => ({
      ...version,
      nodes: JSON.parse(version.nodes as string),
      connections: JSON.parse(version.connections as string),
    }));

    return NextResponse.json({
      success: true,
      data: responseVersions,
    });
  } catch (error) {
    console.error('Error fetching strategy versions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { name, description, changeLog } = body;

    // Check if user has write access to the strategy
    const strategy = await prisma.strategy.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id }, // User's own strategy
          {
            sharedStrategies: {
              some: {
                sharedWith: session.user.id,
                permission: { in: ['WRITE', 'ADMIN'] },
              }
            }
          }, // Shared with write permission
        ],
      },
    });

    if (!strategy) {
      return NextResponse.json(
        { error: 'Strategy not found or access denied' },
        { status: 404 }
      );
    }

    // Get the latest version number
    const latestVersion = await prisma.strategyVersion.findFirst({
      where: {
        strategyId: params.id,
      },
      orderBy: {
        version: 'desc',
      },
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    // Create new version from current strategy state
    const newVersion = await prisma.strategyVersion.create({
      data: {
        strategyId: params.id,
        version: newVersionNumber,
        name: name || strategy.name,
        description: description || strategy.description,
        nodes: strategy.nodes,
        connections: strategy.connections,
        pineScriptCode: strategy.pineScriptCode,
        changeLog: changeLog || `Version ${newVersionNumber}`,
      },
    });

    // Update strategy version number
    await prisma.strategy.update({
      where: { id: params.id },
      data: { version: newVersionNumber },
    });

    // Parse the response data
    const responseVersion = {
      ...newVersion,
      nodes: JSON.parse(newVersion.nodes as string),
      connections: JSON.parse(newVersion.connections as string),
    };

    return NextResponse.json({
      success: true,
      data: responseVersion,
    });
  } catch (error) {
    console.error('Error creating strategy version:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}