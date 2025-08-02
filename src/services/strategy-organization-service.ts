import { prisma } from '@/lib/prisma';
import { StrategyFolder, StrategyTemplate, TradingStrategy } from '@/types/strategy';

export class StrategyOrganizationService {
  /**
   * Get folder hierarchy for a user
   */
  static async getFolderHierarchy(userId: string) {
    const folders = await prisma.strategyFolder.findMany({
      where: { userId },
      include: {
        children: {
          include: {
            _count: {
              select: {
                strategies: true,
                children: true,
              }
            }
          }
        },
        _count: {
          select: {
            strategies: true,
            children: true,
          }
        }
      },
      orderBy: { name: 'asc' },
    });

    // Build hierarchy tree
    const rootFolders = folders.filter(folder => !folder.parentId);
    const buildTree = (parentFolders: any[]): any[] => {
      return parentFolders.map(folder => ({
        ...folder,
        children: buildTree(folders.filter(f => f.parentId === folder.id)),
      }));
    };

    return buildTree(rootFolders);
  }

  /**
   * Get popular tags across all user strategies
   */
  static async getPopularTags(userId: string, limit = 20) {
    const strategies = await prisma.strategy.findMany({
      where: { userId },
      select: { tags: true },
    });

    const tagCounts: { [key: string]: number } = {};
    
    strategies.forEach(strategy => {
      if (strategy.tags) {
        const strategyTags = JSON.parse(strategy.tags);
        strategyTags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  /**
   * Get strategy organization statistics
   */
  static async getOrganizationStats(userId: string) {
    const [
      totalStrategies,
      totalFolders,
      strategiesInFolders,
      strategiesWithTags,
      publicStrategies,
      sharedStrategies,
      templatesUsed,
    ] = await Promise.all([
      prisma.strategy.count({ where: { userId } }),
      prisma.strategyFolder.count({ where: { userId } }),
      prisma.strategy.count({ 
        where: { 
          userId, 
          folderId: { not: null } 
        } 
      }),
      prisma.strategy.count({ 
        where: { 
          userId, 
          tags: { not: null } 
        } 
      }),
      prisma.strategy.count({ 
        where: { 
          userId, 
          isPublic: true 
        } 
      }),
      prisma.sharedStrategy.count({ 
        where: { sharedBy: userId } 
      }),
      prisma.strategy.count({ 
        where: { 
          userId, 
          templateId: { not: null } 
        } 
      }),
    ]);

    return {
      totalStrategies,
      totalFolders,
      strategiesInFolders,
      strategiesWithTags,
      publicStrategies,
      sharedStrategies,
      templatesUsed,
      organizationScore: Math.round(
        ((strategiesInFolders + strategiesWithTags) / (totalStrategies * 2)) * 100
      ),
    };
  }

  /**
   * Bulk move strategies to folder
   */
  static async bulkMoveStrategies(
    strategyIds: string[], 
    folderId: string | null, 
    userId: string
  ) {
    // Verify user owns all strategies
    const strategies = await prisma.strategy.findMany({
      where: {
        id: { in: strategyIds },
        userId,
      },
      select: { id: true },
    });

    if (strategies.length !== strategyIds.length) {
      throw new Error('Some strategies not found or access denied');
    }

    // Verify folder ownership if folderId is provided
    if (folderId) {
      const folder = await prisma.strategyFolder.findFirst({
        where: { id: folderId, userId },
      });

      if (!folder) {
        throw new Error('Folder not found or access denied');
      }
    }

    // Update strategies
    await prisma.strategy.updateMany({
      where: { id: { in: strategyIds } },
      data: { folderId },
    });

    return strategies.length;
  }

  /**
   * Bulk add tags to strategies
   */
  static async bulkAddTags(
    strategyIds: string[], 
    tagsToAdd: string[], 
    userId: string
  ) {
    const strategies = await prisma.strategy.findMany({
      where: {
        id: { in: strategyIds },
        userId,
      },
      select: { id: true, tags: true },
    });

    if (strategies.length !== strategyIds.length) {
      throw new Error('Some strategies not found or access denied');
    }

    // Update each strategy with merged tags
    const updates = strategies.map(strategy => {
      const existingTags = strategy.tags ? JSON.parse(strategy.tags) : [];
      const newTags = [...new Set([...existingTags, ...tagsToAdd])];
      
      return prisma.strategy.update({
        where: { id: strategy.id },
        data: { tags: JSON.stringify(newTags) },
      });
    });

    await Promise.all(updates);
    return strategies.length;
  }

  /**
   * Get strategies that need organization (no folder, no tags)
   */
  static async getUnorganizedStrategies(userId: string) {
    return prisma.strategy.findMany({
      where: {
        userId,
        AND: [
          { folderId: null },
          { 
            OR: [
              { tags: null },
              { tags: '[]' },
            ]
          }
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Suggest folder for strategy based on category and existing patterns
   */
  static async suggestFolderForStrategy(strategyId: string, userId: string) {
    const strategy = await prisma.strategy.findFirst({
      where: { id: strategyId, userId },
      select: { category: true, tags: true },
    });

    if (!strategy) {
      throw new Error('Strategy not found');
    }

    // Find folders with similar strategies
    const suggestions = await prisma.strategyFolder.findMany({
      where: {
        userId,
        strategies: {
          some: {
            OR: [
              ...(strategy.category ? [{ category: strategy.category }] : []),
              // Could add tag-based matching here
            ],
          },
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            strategies: true,
          },
        },
      },
      orderBy: {
        strategies: {
          _count: 'desc',
        },
      },
      take: 3,
    });

    return suggestions;
  }

  /**
   * Get template usage statistics
   */
  static async getTemplateUsageStats() {
    const templates = await prisma.strategyTemplate.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        difficulty: true,
        isOfficial: true,
        _count: {
          select: {
            strategies: true,
          },
        },
      },
      orderBy: {
        strategies: {
          _count: 'desc',
        },
      },
    });

    const totalUsage = templates.reduce((sum, t) => sum + t._count.strategies, 0);
    
    return {
      templates: templates.map(template => ({
        ...template,
        usagePercentage: totalUsage > 0 
          ? Math.round((template._count.strategies / totalUsage) * 100)
          : 0,
      })),
      totalTemplates: templates.length,
      totalUsage,
      mostPopular: templates[0] || null,
    };
  }

  /**
   * Clean up empty folders
   */
  static async cleanupEmptyFolders(userId: string) {
    const emptyFolders = await prisma.strategyFolder.findMany({
      where: {
        userId,
        strategies: { none: {} },
        children: { none: {} },
      },
      select: { id: true, name: true },
    });

    if (emptyFolders.length > 0) {
      await prisma.strategyFolder.deleteMany({
        where: {
          id: { in: emptyFolders.map(f => f.id) },
        },
      });
    }

    return emptyFolders.length;
  }

  /**
   * Export user's organization structure
   */
  static async exportOrganizationStructure(userId: string) {
    const [folders, strategies, templates] = await Promise.all([
      prisma.strategyFolder.findMany({
        where: { userId },
        include: {
          children: true,
          strategies: {
            select: {
              id: true,
              name: true,
              category: true,
              tags: true,
            },
          },
        },
      }),
      prisma.strategy.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          tags: true,
          folderId: true,
          templateId: true,
          isPublic: true,
          createdAt: true,
        },
      }),
      prisma.strategyTemplate.findMany({
        where: {
          strategies: {
            some: { userId },
          },
        },
        select: {
          id: true,
          name: true,
          category: true,
          difficulty: true,
        },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      userId,
      folders: folders.map(folder => ({
        ...folder,
        strategies: folder.strategies.map(s => ({
          ...s,
          tags: s.tags ? JSON.parse(s.tags) : [],
        })),
      })),
      strategies: strategies.map(s => ({
        ...s,
        tags: s.tags ? JSON.parse(s.tags) : [],
      })),
      templates,
    };
  }
}