/**
 * Template Access Check API
 * 
 * Check if user can access a specific template
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { templateAccessService } from '@/services/subscription/TemplateAccessService';

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

    const templateId = params.id;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const accessCheck = await templateAccessService.canUseTemplate(
      session.user.id,
      templateId
    );

    return NextResponse.json({
      success: true,
      data: {
        templateId,
        canUse: accessCheck.canUse,
        reason: accessCheck.reason,
        requiresUpgrade: accessCheck.requiresUpgrade,
        upgradeFeature: 'premium_templates'
      }
    });

  } catch (error) {
    console.error('Error checking template access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}