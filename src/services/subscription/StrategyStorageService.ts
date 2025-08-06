/**
 * Strategy Storage Service
 * 
 * Handles strategy count validation and quota management
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StrategyStorageInfo {
  userId: string;
  strategiesCount: number;
  strategiesLimit: number | 'unlimited';
  canSaveNew: boolean;
  strategies: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export class StrategyStorageService {
  
  /**
   * Get user's strategy storage information
   */
  async getStorageInfo(userId: string): Promise<StrategyStorageInfo> {
    try {
      // Get user's subscription to determine limits
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: userId,
          status: 'ACTIVE'
        },
        include: {
          plan: true
        }
      });

      // Default to free plan if no subscription found
      let strategiesLimit: number | 'unlimited' = 1;
      
      if (subscription?.plan) {
        const limits = subscription.plan.limits as any;
        strategiesLimit = limits.scriptStorage || 1;
      }

      // Get user's strategies
      const strategies = await prisma.strategy.findMany({
        where: {
          userId: userId
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      const strategiesCount = strategies.length;
      const canSaveNew = strategiesLimit === 'unlimited' || strategiesCount < strategiesLimit;

      return {
        userId,
        strategiesCount,
        strategiesLimit,
        canSaveNew,
        strategies
      };

    } catch (error) {
      console.error('Error getting strategy storage info:', error);
      throw new Error('Failed to get strategy storage information');
    }
  }

  /**
   * Validate if user can save a new strategy
   */
  async canSaveStrategy(userId: string): Promise<{
    canSave: boolean;
    reason?: string;
    currentCount: number;
    limit: number | 'unlimited';
  }> {
    try {
      const storageInfo = await this.getStorageInfo(userId);

      if (storageInfo.canSaveNew) {
        return {
          canSave: true,
          currentCount: storageInfo.strategiesCount,
          limit: storageInfo.strategiesLimit
        };
      }

      return {
        canSave: false,
        reason: `Strategy limit reached (${storageInfo.strategiesCount}/${storageInfo.strategiesLimit})`,
        currentCount: storageInfo.strategiesCount,
        limit: storageInfo.strategiesLimit
      };

    } catch (error) {
      console.error('Error validating strategy save:', error);
      return {
        canSave: false,
        reason: 'Error validating storage limit',
        currentCount: 0,
        limit: 0
      };
    }
  }

  /**
   * Validate strategy save before creation
   */
  async validateStrategySave(userId: string, strategyId?: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check if this is an update to existing strategy
      if (strategyId) {
        const existingStrategy = await prisma.strategy.findFirst({
          where: {
            id: strategyId,
            userId: userId
          }
        });

        if (existingStrategy) {
          // This is an update, no need to check limits
          return { isValid: true, errors, warnings };
        }
      }

      // Check storage limits for new strategy
      const canSave = await this.canSaveStrategy(userId);
      
      if (!canSave.canSave) {
        errors.push(canSave.reason || 'Cannot save strategy');
      }

      // Add warnings for users approaching limits
      if (canSave.limit !== 'unlimited' && canSave.currentCount >= canSave.limit * 0.8) {
        warnings.push(`You're approaching your strategy limit (${canSave.currentCount}/${canSave.limit})`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Error validating strategy save:', error);
      return {
        isValid: false,
        errors: ['Failed to validate strategy save'],
        warnings: []
      };
    }
  }

  /**
   * Get strategies that can be deleted (for replacement)
   */
  async getDeletableStrategies(userId: string): Promise<{
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    canDelete: boolean;
    deleteReason?: string;
  }[]> {
    try {
      const strategies = await prisma.strategy.findMany({
        where: {
          userId: userId
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      return strategies.map(strategy => ({
        ...strategy,
        canDelete: true, // All user strategies can be deleted
        deleteReason: undefined
      }));

    } catch (error) {
      console.error('Error getting deletable strategies:', error);
      return [];
    }
  }

  /**
   * Delete a strategy to make room for a new one
   */
  async deleteStrategyForReplacement(userId: string, strategyId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Verify the strategy belongs to the user
      const strategy = await prisma.strategy.findFirst({
        where: {
          id: strategyId,
          userId: userId
        }
      });

      if (!strategy) {
        return {
          success: false,
          message: 'Strategy not found or access denied'
        };
      }

      // Delete the strategy
      await prisma.strategy.delete({
        where: {
          id: strategyId
        }
      });

      return {
        success: true,
        message: `Strategy "${strategy.name}" deleted successfully`
      };

    } catch (error) {
      console.error('Error deleting strategy:', error);
      return {
        success: false,
        message: 'Failed to delete strategy'
      };
    }
  }

  /**
   * Record strategy creation for usage tracking
   */
  async recordStrategyCreation(userId: string, strategyId: string): Promise<void> {
    try {
      // This could be used for analytics or usage tracking
      console.log(`Strategy created: ${strategyId} by user ${userId}`);
      
      // Future: Add to usage metrics table
      // await prisma.usageMetric.create({
      //   data: {
      //     userId,
      //     metricType: 'strategy_created',
      //     metricValue: 1,
      //     // ... other fields
      //   }
      // });

    } catch (error) {
      console.error('Error recording strategy creation:', error);
      // Don't throw error as this is not critical
    }
  }
}

// Export singleton instance
export const strategyStorageService = new StrategyStorageService();