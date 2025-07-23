import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { StrategyImportData } from '@/types/strategy';

export async function POST(request: NextRequest) {
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
      importData, 
      folderId, 
      preserveVersions = false,
      overwriteExisting = false 
    } = body;

    if (!importData) {
      return NextResponse.json(
        { error: 'Import data is required' },
        { status: 400 }
      );
    }

    // Validate import data structure
    if (!importData.strategy || !importData.strategy.name) {
      return NextResponse.json(
        { error: 'Invalid import data: strategy name is required' },
        { status: 400 }
      );
    }

    const strategyData = importData.strategy;

    // Validate required fields
    if (!strategyData.nodes || !Array.isArray(strategyData.nodes)) {
      return NextResponse.json(
        { error: 'Invalid import data: strategy nodes are required' },
        { status: 400 }
      );
    }

    if (!strategyData.connections || !Array.isArray(strategyData.connections)) {
      return NextResponse.json(
        { error: 'Invalid import data: strategy connections are required' },
        { status: 400 }
      );
    }

    // Check if strategy with same name already exists
    if (!overwriteExisting) {
      const existingStrategy = await prisma.strategy.findFirst({
        where: {
          userId: session.user.id,
          name: strategyData.name,
        },
      });

      if (existingStrategy) {
        return NextResponse.json(
          { 
            error: 'Strategy with this name already exists',
            code: 'STRATEGY_EXISTS',
            existingStrategyId: existingStrategy.id,
          },
          { status: 409 }
        );
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

    // Generate unique name if overwriting is not allowed and name exists
    let finalName = strategyData.name;
    if (!overwriteExisting) {
      let counter = 1;
      while (await prisma.strategy.findFirst({
        where: {
          userId: session.user.id,
          name: finalName,
        },
      })) {
        finalName = `${strategyData.name} (${counter})`;
        counter++;
      }
    }

    // Create the imported strategy
    const importedStrategy = await prisma.strategy.create({
      data: {
        userId: session.user.id,
        name: finalName,
        description: strategyData.description || 'Imported strategy',
        category: strategyData.category,
        nodes: JSON.stringify(strategyData.nodes),
        connections: JSON.stringify(strategyData.connections),
        pineScriptCode: strategyData.pineScriptCode,
        isPublic: false, // Always import as private
        tags: strategyData.tags ? JSON.stringify(strategyData.tags) : null,
        folderId,
        version: 1,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          }
        },
      },
    });

    // Create initial version
    await prisma.strategyVersion.create({
      data: {
        strategyId: importedStrategy.id,
        version: 1,
        name: importedStrategy.name,
        description: importedStrategy.description,
        nodes: importedStrategy.nodes,
        connections: importedStrategy.connections,
        pineScriptCode: importedStrategy.pineScriptCode,
        changeLog: 'Imported strategy - Initial version',
      },
    });

    // Import versions if requested and available
    if (preserveVersions && importData.versions && Array.isArray(importData.versions)) {
      for (const versionData of importData.versions) {
        if (versionData.version > 1) { // Skip version 1 as it's already created
          await prisma.strategyVersion.create({
            data: {
              strategyId: importedStrategy.id,
              version: versionData.version,
              name: versionData.name,
              description: versionData.description,
              nodes: JSON.stringify(versionData.nodes),
              connections: JSON.stringify(versionData.connections),
              pineScriptCode: versionData.pineScriptCode,
              changeLog: versionData.changeLog || `Imported version ${versionData.version}`,
            },
          });
        }
      }

      // Update strategy to latest version if versions were imported
      const latestVersion = Math.max(...importData.versions.map((v: any) => v.version));
      if (latestVersion > 1) {
        const latestVersionData = importData.versions.find((v: any) => v.version === latestVersion);
        if (latestVersionData) {
          await prisma.strategy.update({
            where: { id: importedStrategy.id },
            data: {
              version: latestVersion,
              name: latestVersionData.name,
              description: latestVersionData.description,
              nodes: JSON.stringify(latestVersionData.nodes),
              connections: JSON.stringify(latestVersionData.connections),
              pineScriptCode: latestVersionData.pineScriptCode,
            },
          });
        }
      }
    }

    // Parse the response data
    const responseStrategy = {
      ...importedStrategy,
      nodes: JSON.parse(importedStrategy.nodes as string),
      connections: JSON.parse(importedStrategy.connections as string),
      tags: importedStrategy.tags ? JSON.parse(importedStrategy.tags) : [],
    };

    return NextResponse.json({
      success: true,
      data: responseStrategy,
      message: `Strategy "${finalName}" imported successfully`,
      versionsImported: preserveVersions && importData.versions ? importData.versions.length : 1,
    });
  } catch (error) {
    console.error('Error importing strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}