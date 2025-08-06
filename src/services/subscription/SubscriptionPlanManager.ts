/**
 * Subscription Plan Manager
 * 
 * Manages subscription plans, features, and user access control
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

export interface PlanLimits {
  strategiesPerMonth: number | 'unlimited';
  templatesAccess: 'basic' | 'all';
  aiGenerations: number | 'unlimited';
  aiChatAccess: boolean;
  scriptStorage: number | 'unlimited';
  exportFormats: string[];
  supportLevel: 'community' | 'priority' | 'dedicated';
  customSignatures: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  teamCollaboration: boolean;
  advancedIndicators: boolean;
  backtesting: boolean;
}

export interface SubscriptionPlanDetails {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: PlanFeature[];
  limits: PlanLimits;
  isPopular: boolean;
  trialDays: number;
  isActive: boolean;
}

export interface UserSubscriptionInfo {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planDisplayName: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  isActive: boolean;
  features: PlanFeature[];
  limits: PlanLimits;
}

export class SubscriptionPlanManager {
  
  /**
   * Get all available subscription plans
   */
  async getAvailablePlans(): Promise<SubscriptionPlanDetails[]> {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { monthlyPrice: 'asc' }
      });

      return plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        monthlyPrice: Number(plan.monthlyPrice),
        annualPrice: Number(plan.annualPrice),
        currency: plan.currency,
        features: plan.features as PlanFeature[],
        limits: plan.limits as PlanLimits,
        isPopular: plan.isPopular,
        trialDays: plan.trialDays,
        isActive: plan.isActive
      }));

    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw new Error('Failed to fetch subscription plans');
    }
  }

  /**
   * Get a specific subscription plan by ID
   */
  async getPlanById(planId: string): Promise<SubscriptionPlanDetails | null> {
    try {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId }
      });

      if (!plan) {
        return null;
      }

      return {
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        monthlyPrice: Number(plan.monthlyPrice),
        annualPrice: Number(plan.annualPrice),
        currency: plan.currency,
        features: plan.features as PlanFeature[],
        limits: plan.limits as PlanLimits,
        isPopular: plan.isPopular,
        trialDays: plan.trialDays,
        isActive: plan.isActive
      };

    } catch (error) {
      console.error('Error fetching subscription plan:', error);
      throw new Error('Failed to fetch subscription plan');
    }
  }

  /**
   * Get a plan by name (free, pro, premium)
   */
  async getPlanByName(planName: string): Promise<SubscriptionPlanDetails | null> {
    try {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { name: planName }
      });

      if (!plan) {
        return null;
      }

      return {
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description,
        monthlyPrice: Number(plan.monthlyPrice),
        annualPrice: Number(plan.annualPrice),
        currency: plan.currency,
        features: plan.features as PlanFeature[],
        limits: plan.limits as PlanLimits,
        isPopular: plan.isPopular,
        trialDays: plan.trialDays,
        isActive: plan.isActive
      };

    } catch (error) {
      console.error('Error fetching subscription plan by name:', error);
      throw new Error('Failed to fetch subscription plan');
    }
  }

  /**
   * Get user's current subscription information
   */
  async getUserSubscription(userId: string): Promise<UserSubscriptionInfo | null> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { 
          userId: userId,
          status: 'ACTIVE'
        },
        include: {
          plan: true
        }
      });

      if (!subscription) {
        // Return free plan as default
        const freePlan = await this.getPlanByName('free');
        if (freePlan) {
          return {
            id: 'free-subscription',
            userId: userId,
            planId: freePlan.id,
            planName: freePlan.name,
            planDisplayName: freePlan.displayName,
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            cancelAtPeriodEnd: false,
            isActive: true,
            features: freePlan.features,
            limits: freePlan.limits
          };
        }
        return null;
      }

      return {
        id: subscription.id,
        userId: subscription.userId,
        planId: subscription.planId,
        planName: subscription.plan.name,
        planDisplayName: subscription.plan.displayName,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: subscription.trialEnd || undefined,
        isActive: subscription.status === 'ACTIVE',
        features: subscription.plan.features as PlanFeature[],
        limits: subscription.plan.limits as PlanLimits
      };

    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw new Error('Failed to fetch user subscription');
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  async checkFeatureAccess(userId: string, featureId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return false;
      }

      const feature = subscription.features.find(f => f.id === featureId);
      return feature ? feature.included : false;

    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Check if user has access to Pine Genie AI Chat
   */
  async checkAIChatAccess(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return false;
      }

      return subscription.limits.aiChatAccess === true;

    } catch (error) {
      console.error('Error checking AI chat access:', error);
      return false;
    }
  }

  /**
   * Check script storage limit
   */
  async checkScriptStorageLimit(userId: string): Promise<{
    hasAccess: boolean;
    currentCount: number;
    limit: number | 'unlimited';
    remaining: number | 'unlimited';
  }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return {
          hasAccess: false,
          currentCount: 0,
          limit: 0,
          remaining: 0
        };
      }

      // Get current strategy count from database
      const currentCount = await prisma.strategy.count({
        where: { 
          userId: userId
        }
      });

      const limit = subscription.limits.scriptStorage;

      if (limit === 'unlimited') {
        return {
          hasAccess: true,
          currentCount: currentCount,
          limit: 'unlimited',
          remaining: 'unlimited'
        };
      }

      const remaining = Math.max(0, (limit as number) - currentCount);
      
      return {
        hasAccess: remaining > 0,
        currentCount: currentCount,
        limit: limit,
        remaining: remaining
      };

    } catch (error) {
      console.error('Error checking script storage limit:', error);
      return {
        hasAccess: false,
        currentCount: 0,
        limit: 0,
        remaining: 0
      };
    }
  }

  /**
   * Check if user has reached usage limit for a feature
   */
  async checkUsageLimit(userId: string, metricType: string): Promise<{
    hasAccess: boolean;
    currentUsage: number;
    limit: number | 'unlimited';
    remaining: number | 'unlimited';
  }> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        return {
          hasAccess: false,
          currentUsage: 0,
          limit: 0,
          remaining: 0
        };
      }

      // Get current period usage
      const currentUsage = await prisma.usageMetric.aggregate({
        where: {
          userId: userId,
          metricType: metricType,
          periodStart: {
            gte: subscription.currentPeriodStart
          },
          periodEnd: {
            lte: subscription.currentPeriodEnd
          }
        },
        _sum: {
          metricValue: true
        }
      });

      const usage = currentUsage._sum.metricValue || 0;
      
      // Get limit from subscription plan
      let limit: number | 'unlimited' = 0;
      
      switch (metricType) {
        case 'strategies_generated':
          limit = subscription.limits.strategiesPerMonth;
          break;
        case 'ai_generations':
          limit = subscription.limits.aiGenerations;
          break;
        default:
          limit = 'unlimited';
      }

      if (limit === 'unlimited') {
        return {
          hasAccess: true,
          currentUsage: usage,
          limit: 'unlimited',
          remaining: 'unlimited'
        };
      }

      const remaining = Math.max(0, (limit as number) - usage);
      
      return {
        hasAccess: remaining > 0,
        currentUsage: usage,
        limit: limit,
        remaining: remaining
      };

    } catch (error) {
      console.error('Error checking usage limit:', error);
      return {
        hasAccess: false,
        currentUsage: 0,
        limit: 0,
        remaining: 0
      };
    }
  }

  /**
   * Record usage for a metric
   */
  async recordUsage(userId: string, metricType: string, value: number = 1): Promise<void> {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      await prisma.usageMetric.upsert({
        where: {
          userId_metricType_periodStart_periodEnd: {
            userId: userId,
            metricType: metricType,
            periodStart: subscription.currentPeriodStart,
            periodEnd: subscription.currentPeriodEnd
          }
        },
        update: {
          metricValue: {
            increment: value
          }
        },
        create: {
          userId: userId,
          subscriptionId: subscription.id,
          metricType: metricType,
          metricValue: value,
          periodStart: subscription.currentPeriodStart,
          periodEnd: subscription.currentPeriodEnd
        }
      });

    } catch (error) {
      console.error('Error recording usage:', error);
      throw new Error('Failed to record usage');
    }
  }

  /**
   * Get user's usage statistics
   */
  async getUserUsageStats(userId: string): Promise<{
    strategiesGenerated: { current: number; limit: number | 'unlimited' };
    aiGenerations: { current: number; limit: number | 'unlimited' };
    templatesUsed: { current: number; limit: number | 'unlimited' };
  }> {
    try {
      const strategiesUsage = await this.checkUsageLimit(userId, 'strategies_generated');
      const aiUsage = await this.checkUsageLimit(userId, 'ai_generations');
      const templatesUsage = await this.checkUsageLimit(userId, 'templates_used');

      return {
        strategiesGenerated: {
          current: strategiesUsage.currentUsage,
          limit: strategiesUsage.limit
        },
        aiGenerations: {
          current: aiUsage.currentUsage,
          limit: aiUsage.limit
        },
        templatesUsed: {
          current: templatesUsage.currentUsage,
          limit: templatesUsage.limit
        }
      };

    } catch (error) {
      console.error('Error fetching usage stats:', error);
      throw new Error('Failed to fetch usage statistics');
    }
  }

  /**
   * Create a new subscription for a user
   */
  async createSubscription(
    userId: string, 
    planId: string, 
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): Promise<UserSubscriptionInfo> {
    try {
      console.log('Creating subscription for user:', userId, 'plan:', planId);
      
      const plan = await this.getPlanById(planId);
      
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Check for existing subscriptions
      const existingSubscriptions = await prisma.subscription.findMany({
        where: { userId: userId },
        include: { plan: true }
      });
      
      console.log('Existing subscriptions:', existingSubscriptions.length);

      // Calculate period dates
      const now = new Date();
      const periodEnd = new Date();
      
      if (billingCycle === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      // Calculate trial end if applicable
      let trialEnd: Date | undefined;
      if (plan.trialDays > 0) {
        trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + plan.trialDays);
      }

      // First, try to find existing active subscription
      const existingActiveSubscription = await prisma.subscription.findFirst({
        where: {
          userId: userId,
          status: { in: ['ACTIVE', 'TRIALING'] }
        },
        include: { plan: true }
      });

      let subscription;

      if (existingActiveSubscription) {
        // Update existing subscription
        console.log('Updating existing subscription:', existingActiveSubscription.id);
        subscription = await prisma.subscription.update({
          where: { id: existingActiveSubscription.id },
          data: {
            planId: planId,
            status: trialEnd ? 'TRIALING' : 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            trialEnd: trialEnd,
            cancelAtPeriodEnd: false
          },
          include: {
            plan: true
          }
        });
      } else {
        // Create new subscription
        console.log('Creating new subscription with data:', {
          userId,
          planId,
          status: trialEnd ? 'TRIALING' : 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          trialEnd,
          cancelAtPeriodEnd: false
        });

        subscription = await prisma.subscription.create({
          data: {
            userId: userId,
            planId: planId,
            status: trialEnd ? 'TRIALING' : 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            trialEnd: trialEnd,
            cancelAtPeriodEnd: false
          },
          include: {
            plan: true
          }
        });
      }

      return {
        id: subscription.id,
        userId: subscription.userId,
        planId: subscription.planId,
        planName: subscription.plan.name,
        planDisplayName: subscription.plan.displayName,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: subscription.trialEnd || undefined,
        isActive: subscription.status === 'ACTIVE' || subscription.status === 'TRIALING',
        features: subscription.plan.features as PlanFeature[],
        limits: subscription.plan.limits as PlanLimits
      };

    } catch (error) {
      console.error('Error creating subscription:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        planId,
        billingCycle
      });
      throw new Error(`Failed to create subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    try {
      await prisma.subscription.updateMany({
        where: {
          userId: userId,
          status: 'ACTIVE'
        },
        data: {
          cancelAtPeriodEnd: cancelAtPeriodEnd,
          status: cancelAtPeriodEnd ? 'ACTIVE' : 'CANCELED'
        }
      });

    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Upgrade/Downgrade subscription
   */
  async changeSubscription(
    userId: string, 
    newPlanId: string,
    billingCycle: 'monthly' | 'annual' = 'monthly'
  ): Promise<UserSubscriptionInfo> {
    try {
      // Cancel current subscription
      await this.cancelSubscription(userId, false);
      
      // Create new subscription
      return await this.createSubscription(userId, newPlanId, billingCycle);

    } catch (error) {
      console.error('Error changing subscription:', error);
      throw new Error('Failed to change subscription');
    }
  }
}

// Export singleton instance
export const subscriptionPlanManager = new SubscriptionPlanManager();