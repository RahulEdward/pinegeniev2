/**
 * Check Subscription Access API
 * 
 * GET /api/subscription/check-access?feature=ai_chat - Check specific feature access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { subscriptionPlanManager } from '@/services/subscription';

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

    switch (feature) {
      case 'ai_chat':
        hasAccess = await subscriptionPlanManager.checkAIChatAccess(session.user.id);
        break;
      
      case 'script_storage':
        const storageInfo = await subscriptionPlanManager.checkScriptStorageLimit(session.user.id);
        hasAccess = storageInfo.hasAccess;
        additionalInfo = storageInfo;
        break;
      
      default:
        hasAccess = await subscriptionPlanManager.checkFeatureAccess(session.user.id, feature);
        break;
    }

    return NextResponse.json({
      success: true,
      hasAccess: hasAccess,
      feature: feature,
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