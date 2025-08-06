/**
 * Strategy Storage API
 * 
 * Endpoints for strategy storage validation and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { strategyStorageService } from '@/services/subscription/StrategyStorageService';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = session.user.id;

    switch (action) {
      case 'info':
        const storageInfo = await strategyStorageService.getStorageInfo(userId);
        return NextResponse.json({
          success: true,
          data: storageInfo
        });

      case 'validate':
        const strategyId = searchParams.get('strategyId');
        const validation = await strategyStorageService.validateStrategySave(userId, strategyId || undefined);
        return NextResponse.json({
          success: true,
          data: validation
        });

      case 'can-save':
        const canSave = await strategyStorageService.canSaveStrategy(userId);
        return NextResponse.json({
          success: true,
          data: canSave
        });

      case 'deletable':
        const deletableStrategies = await strategyStorageService.getDeletableStrategies(userId);
        return NextResponse.json({
          success: true,
          data: deletableStrategies
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in strategy storage API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get('strategyId');

    if (!strategyId) {
      return NextResponse.json(
        { error: 'Strategy ID is required' },
        { status: 400 }
      );
    }

    const result = await strategyStorageService.deleteStrategyForReplacement(
      session.user.id,
      strategyId
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      });
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error deleting strategy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}