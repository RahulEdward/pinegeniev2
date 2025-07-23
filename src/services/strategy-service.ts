import { prisma } from '@/lib/prisma';
import { TradingStrategy, StrategySearchFilters, StrategyImportData } from '@/types/strategy';

export class StrategyService {
  /**
   * Check if user has access to a strategy
   */
  static async checkStrategyAccess(
    strategyId: string, 
    userId: string, 
    requiredPermission: 'READ' | 'WRITE' | 'ADMIN' = 'READ'
  ) {
    const strategy = await prisma.strategy.findFirst({
      where: {
        id: strategyId,
        OR: [
          { userId }, // User's own strategy
          ...(requiredPermission === 'READ' ? [{ isPublic: true }] : []), // Public strategy (read only)
          {
            sharedStrategies: {
              some: {
                sharedWith: userId,
                permission: requiredPermission === 'READ' 
                  ? { in: ['READ', 'WRITE', 'ADMIN'] }
                  : requiredPermission === 'WRITE'
                  ? { in: ['WRITE', 'ADMIN'] }
                  : 'ADMIN',
              }
            }
          }, // Shared with appropriate permission
        ],
      },
    });

    return strategy;
  }

  /**
   * Parse JSON fields in strategy data
   */
  static parseStrategyData(strategy: any) {
    return {
      ...strategy,
      nodes: typeof strategy.nodes === 'string' ? JSON.parse(strategy.nodes) : strategy.nodes,
      connections: typeof strategy.connections === 'string' ? JSON.parse(strategy.connections) : strategy.connections,
      tags: strategy.tags ? (typeof strategy.tags === 'string' ? JSON.parse(strategy.tags) : strategy.tags) : [],
    };
  }

  /**
   * Generate unique strategy name
   */
  static async generateUniqueName(baseName: string, userId: string, excludeId?: string) {
    let uniqueName = baseName;
    let counter = 1;

    while (true) {
      const existing = await prisma.strategy.findFirst({
        where: {
          userId,
          name: uniqueName,
          ...(excludeId && { id: { not: excludeId } }),
        },
      });

      if (!existing) {
        break;
      }

      uniqueName = `${baseName} (${counter})`;
      counter++;
    }

    return uniqueName;
  }

  /**
   * Create a new strategy version
   */
  static async createVersion(
    strategyId: string,
    versionData: {
      name: string;
      description?: string;
      nodes: any;
      connections: any;
      pineScriptCode?: string;
      changeLog?: string;
    }
  ) {
    // Get the latest version number
    const latestVersion = await prisma.strategyVersion.findFirst({
      where: { strategyId },
      orderBy: { version: 'desc' },
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    // Create new version
    const version = await prisma.strategyVersion.create({
      data: {
        strategyId,
        version: newVersionNumber,
        name: versionData.name,
        description: versionData.description,
        nodes: JSON.stringify(versionData.nodes),
        connections: JSON.stringify(versionData.connections),
        pineScriptCode: versionData.pineScriptCode,
        changeLog: versionData.changeLog || `Version ${newVersionNumber}`,
      },
    });

    // Update strategy version number
    await prisma.strategy.update({
      where: { id: strategyId },
      data: { version: newVersionNumber },
    });

    return { version, versionNumber: newVersionNumber };
  }

  /**
   * Get strategy statistics for a user
   */
  static async getUserStrategyStats(userId: string) {
    const [
      totalStrategies,
      publicStrategies,
      strategiesWithBacktests,
      totalVersions,
      categoryCounts,
      recentActivity,
    ] = await Promise.all([
      prisma.strategy.count({ where: { userId } }),
      prisma.strategy.count({ where: { userId, isPublic: true } }),
      prisma.strategy.count({
        where: {
          userId,
          backtestResults: { some: {} },
        },
      }),
      prisma.strategyVersion.count({
        where: { strategy: { userId } },
      }),
      prisma.strategy.groupBy({
        by: ['category'],
        where: { 
          userId,
          category: { not: null },
        },
        _count: { category: true },
      }),
      prisma.strategy.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalStrategies,
      publicStrategies,
      strategiesWithBacktests,
      totalVersions,
      categoryCounts: categoryCounts.map(c => ({
        category: c.category,
        count: c._count.category,
      })),
      recentActivity,
    };
  }

  /**
   * Validate strategy data
   */
  static validateStrategyData(data: any) {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Strategy name is required');
    }

    if (!data.nodes || !Array.isArray(data.nodes)) {
      errors.push('Strategy nodes are required and must be an array');
    }

    if (!data.connections || !Array.isArray(data.connections)) {
      errors.push('Strategy connections are required and must be an array');
    }

    // Validate nodes structure
    if (data.nodes && Array.isArray(data.nodes)) {
      data.nodes.forEach((node: any, index: number) => {
        if (!node.id || typeof node.id !== 'string') {
          errors.push(`Node ${index}: id is required and must be a string`);
        }
        if (!node.type || !['indicator', 'condition', 'action', 'data'].includes(node.type)) {
          errors.push(`Node ${index}: type must be one of: indicator, condition, action, data`);
        }
        if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
          errors.push(`Node ${index}: position with x and y coordinates is required`);
        }
      });
    }

    // Validate connections structure
    if (data.connections && Array.isArray(data.connections)) {
      data.connections.forEach((connection: any, index: number) => {
        if (!connection.id || typeof connection.id !== 'string') {
          errors.push(`Connection ${index}: id is required and must be a string`);
        }
        if (!connection.source || typeof connection.source !== 'string') {
          errors.push(`Connection ${index}: source is required and must be a string`);
        }
        if (!connection.target || typeof connection.target !== 'string') {
          errors.push(`Connection ${index}: target is required and must be a string`);
        }
      });
    }

    return errors;
  }

  /**
   * Clean up orphaned strategy data
   */
  static async cleanupOrphanedData(userId: string) {
    // This would be called periodically to clean up any orphaned data
    // For now, we'll just return a count of what could be cleaned
    
    const orphanedVersions = await prisma.strategyVersion.count({
      where: {
        strategy: null,
      },
    });

    const orphanedBacktests = await prisma.backtestResult.count({
      where: {
        strategy: null,
      },
    });

    const orphanedShares = await prisma.sharedStrategy.count({
      where: {
        strategy: null,
      },
    });

    return {
      orphanedVersions,
      orphanedBacktests,
      orphanedShares,
    };
  }

  /**
   * Get strategy performance summary
   */
  static async getStrategyPerformanceSummary(strategyId: string) {
    const backtestResults = await prisma.backtestResult.findMany({
      where: {
        strategyId,
        status: 'completed',
      },
      select: {
        performanceMetrics: true,
        completedAt: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 10,
    });

    if (backtestResults.length === 0) {
      return null;
    }

    // Parse and aggregate performance metrics
    const metrics = backtestResults.map(result => 
      JSON.parse(result.performanceMetrics as string)
    );

    const avgMetrics = {
      totalReturn: metrics.reduce((sum, m) => sum + (m.totalReturn || 0), 0) / metrics.length,
      sharpeRatio: metrics.reduce((sum, m) => sum + (m.sharpeRatio || 0), 0) / metrics.length,
      maxDrawdown: metrics.reduce((sum, m) => sum + (m.maxDrawdown || 0), 0) / metrics.length,
      winRate: metrics.reduce((sum, m) => sum + (m.winRate || 0), 0) / metrics.length,
      profitFactor: metrics.reduce((sum, m) => sum + (m.profitFactor || 0), 0) / metrics.length,
    };

    return {
      backtestCount: backtestResults.length,
      averageMetrics: avgMetrics,
      latestBacktest: backtestResults[0],
      bestPerformance: metrics.reduce((best, current) => 
        (current.totalReturn || 0) > (best.totalReturn || 0) ? current : best
      ),
    };
  }
}