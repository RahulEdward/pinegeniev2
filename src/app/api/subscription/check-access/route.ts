/**
 * Check Subscription Access API
 * 
 * GET /api/subscription/check-access?feature=ai_chat - Check specific feature access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { subscriptionPlanManager } from '@/services/subscription';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature');

    if (!feature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Feature parameter is required'
        },
        { status: 400 }
      );
    }

    let hasAccess = false;
    let additionalInfo = {};
    let reason = '';

    switch (feature) {
      case 'ai_chat':
        hasAccess = await subscriptionPlanManager.checkAIChatAccess(session.user.id);
        if (!hasAccess) {
          reason = 'AI Chat access requires a paid subscription plan';
        }
        break;
      
      case 'script_storage':
        const storageInfo = await subscriptionPlanManager.checkScriptStorageLimit(session.user.id);
        hasAccess = storageInfo.hasAccess;
        additionalInfo = storageInfo;
        if (!hasAccess) {
          reason = 'Strategy storage limit reached. Upgrade to save more strategies.';
        }
        break;
      
      case 'premium_templates':
        hasAccess = await subscriptionPlanManager.checkFeatureAccess(session.user.id, 'premium_templates');
        if (!hasAccess) {
          reason = 'Premium templates require a paid subscription plan';
        }
        break;
      
      case 'advanced_indicators':
        hasAccess = await subscriptionPlanManager.checkFeatureAccess(session.user.id, 'advanced_indicators');
        if (!hasAccess) {
          reason = 'Advanced indicators require a Pro or Premium plan';
        }
        break;
      
      case 'backtesting':
        hasAccess = await subscriptionPlanManager.checkFeatureAccess(session.user.id, 'backtesting');
        if (!hasAccess) {
          reason = 'Strategy backtesting requires a Pro or Premium plan';
        }
        break;
      
      case 'custom_signatures':
        hasAccess = await subscriptionPlanManager.checkFeatureAccess(session.user.id, 'custom_signatures');
        if (!hasAccess) {
          reason = 'Custom signatures require a Pro or Premium plan';
        }
        break;
      
      default:
        hasAccess = await subscriptionPlanManager.checkFeatureAccess(session.user.id, feature);
        if (!hasAccess) {
          reason = `Feature '${feature}' requires a paid subscription plan`;
        }
        break;
    }

    return NextResponse.json({
      success: true,
      hasAccess: hasAccess,
      feature: feature,
      reason: reason || undefined,
      ...additionalInfo
    });

  } catch (error) {
    console.error('Error checking subscription access:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check access'
      },
      { status: 500 }
    );
  }
}