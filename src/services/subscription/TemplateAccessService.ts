/**
 * Template Access Service
 * 
 * Handles template filtering and access control based on subscription plans
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TemplateAccessInfo {
  hasAccess: boolean;
  requiresUpgrade: boolean;
  reason?: string;
  upgradeFeature: string;
}

export interface FilteredTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isOfficial: boolean;
  tags: string[];
  hasAccess: boolean;
  requiresUpgrade: boolean;
  accessInfo: TemplateAccessInfo;
}

export class TemplateAccessService {
  
  /**
   * Filter templates based on user's subscription plan
   */
  async filterTemplatesBySubscription(
    userId: string, 
    templates: any[]
  ): Promise<FilteredTemplate[]> {
    try {
      // Get user's subscription to determine template access
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
      let hasAccessToAllTemplates = false;
      
      if (subscription?.plan) {
        const limits = subscription.plan.limits as any;
        hasAccessToAllTemplates = limits.templatesAccess === 'all';
      }

      return templates.map(template => {
        const accessInfo = this.checkTemplateAccess(template, hasAccessToAllTemplates);
        
        return {
          ...template,
          tags: template.tags ? (typeof template.tags === 'string' ? JSON.parse(template.tags) : template.tags) : [],
          hasAccess: accessInfo.hasAccess,
          requiresUpgrade: accessInfo.requiresUpgrade,
          accessInfo
        };
      });

    } catch (error) {
      console.error('Error filtering templates by subscription:', error);
      
      // On error, return templates with conservative access (free plan access only)
      return templates.map(template => {
        const accessInfo = this.checkTemplateAccess(template, false);
        
        return {
          ...template,
          tags: template.tags ? (typeof template.tags === 'string' ? JSON.parse(template.tags) : template.tags) : [],
          hasAccess: accessInfo.hasAccess,
          requiresUpgrade: accessInfo.requiresUpgrade,
          accessInfo
        };
      });
    }
  }

  /**
   * Check if user has access to a specific template
   */
  private checkTemplateAccess(
    template: any, 
    hasAccessToAllTemplates: boolean
  ): TemplateAccessInfo {
    // Free users can access:
    // 1. Beginner difficulty templates
    // 2. Non-official (user-created) templates
    const isFreeAccessible = template.difficulty === 'beginner' || !template.isOfficial;

    if (hasAccessToAllTemplates) {
      return {
        hasAccess: true,
        requiresUpgrade: false,
        upgradeFeature: 'premium_templates'
      };
    }

    if (isFreeAccessible) {
      return {
        hasAccess: true,
        requiresUpgrade: false,
        upgradeFeature: 'premium_templates'
      };
    }

    // Premium template - requires upgrade
    let reason = 'This template requires a Pro subscription';
    
    if (template.difficulty === 'intermediate') {
      reason = 'Intermediate templates require a Pro subscription';
    } else if (template.difficulty === 'advanced') {
      reason = 'Advanced templates require a Pro subscription';
    } else if (template.isOfficial) {
      reason = 'Official templates require a Pro subscription';
    }

    return {
      hasAccess: false,
      requiresUpgrade: true,
      reason,
      upgradeFeature: 'premium_templates'
    };
  }

  /**
   * Get templates accessible to user based on their subscription
   */
  async getAccessibleTemplates(
    userId: string,
    filters: {
      category?: string;
      difficulty?: string;
      search?: string;
      tags?: string[];
      includeRestricted?: boolean; // If true, includes restricted templates with access info
    } = {}
  ): Promise<FilteredTemplate[]> {
    try {
      const { category, difficulty, search, tags, includeRestricted = true } = filters;

      // Build where clause
      const where: any = {};

      if (category) {
        where.category = category;
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get templates from database
      const templates = await prisma.strategyTemplate.findMany({
        where,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          tags: true,
          difficulty: true,
          isOfficial: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Filter by subscription
      let filteredTemplates = await this.filterTemplatesBySubscription(userId, templates);

      // Client-side tag filtering
      if (tags && tags.length > 0) {
        filteredTemplates = filteredTemplates.filter(template => 
          tags.some(tag => template.tags.includes(tag))
        );
      }

      // Filter out restricted templates if not requested
      if (!includeRestricted) {
        filteredTemplates = filteredTemplates.filter(template => template.hasAccess);
      }

      return filteredTemplates;

    } catch (error) {
      console.error('Error getting accessible templates:', error);
      return [];
    }
  }

  /**
   * Check if user can use a specific template
   */
  async canUseTemplate(userId: string, templateId: string): Promise<{
    canUse: boolean;
    reason?: string;
    requiresUpgrade: boolean;
  }> {
    try {
      // Get template
      const template = await prisma.strategyTemplate.findUnique({
        where: { id: templateId }
      });

      if (!template) {
        return {
          canUse: false,
          reason: 'Template not found',
          requiresUpgrade: false
        };
      }

      // Get user's subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: userId,
          status: 'ACTIVE'
        },
        include: {
          plan: true
        }
      });

      let hasAccessToAllTemplates = false;
      
      if (subscription?.plan) {
        const limits = subscription.plan.limits as any;
        hasAccessToAllTemplates = limits.templatesAccess === 'all';
      }

      const accessInfo = this.checkTemplateAccess(template, hasAccessToAllTemplates);

      return {
        canUse: accessInfo.hasAccess,
        reason: accessInfo.reason,
        requiresUpgrade: accessInfo.requiresUpgrade
      };

    } catch (error) {
      console.error('Error checking template usage:', error);
      return {
        canUse: false,
        reason: 'Error checking template access',
        requiresUpgrade: false
      };
    }
  }

  /**
   * Get template categories available to user
   */
  async getAvailableCategories(userId: string): Promise<{
    all: string[];
    accessible: string[];
    restricted: string[];
  }> {
    try {
      // Get all categories
      const allCategories = await prisma.strategyTemplate.findMany({
        select: { category: true },
        distinct: ['category'],
      });

      const categories = allCategories.map(c => c.category);

      // Get user's accessible templates
      const accessibleTemplates = await this.getAccessibleTemplates(userId, { includeRestricted: false });
      const accessibleCategories = [...new Set(accessibleTemplates.map(t => t.category))];

      const restrictedCategories = categories.filter(cat => !accessibleCategories.includes(cat));

      return {
        all: categories,
        accessible: accessibleCategories,
        restricted: restrictedCategories
      };

    } catch (error) {
      console.error('Error getting available categories:', error);
      return {
        all: [],
        accessible: [],
        restricted: []
      };
    }
  }

  /**
   * Get template usage statistics for user
   */
  async getTemplateUsageStats(userId: string): Promise<{
    totalTemplates: number;
    accessibleTemplates: number;
    restrictedTemplates: number;
    usedTemplates: number;
  }> {
    try {
      const [totalTemplates, accessibleTemplates, usedTemplatesCount] = await Promise.all([
        prisma.strategyTemplate.count(),
        this.getAccessibleTemplates(userId, { includeRestricted: false }),
        prisma.strategy.count({
          where: {
            userId: userId,
            templateId: { not: null }
          }
        })
      ]);

      return {
        totalTemplates,
        accessibleTemplates: accessibleTemplates.length,
        restrictedTemplates: totalTemplates - accessibleTemplates.length,
        usedTemplates: usedTemplatesCount
      };

    } catch (error) {
      console.error('Error getting template usage stats:', error);
      return {
        totalTemplates: 0,
        accessibleTemplates: 0,
        restrictedTemplates: 0,
        usedTemplates: 0
      };
    }
  }
}

// Export singleton instance
export const templateAccessService = new TemplateAccessService();