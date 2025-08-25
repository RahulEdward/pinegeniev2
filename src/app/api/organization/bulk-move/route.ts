import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { StrategyOrganizationService } from '@/services/strategy-organization-service';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
    const { strategyIds, folderId } = body;

    if (!strategyIds || !Array.isArray(strategyIds) || strategyIds.length === 0) {
      return NextResponse.json(
        { error: 'Strategy IDs are required and must be a non-empty array' },
        { status: 400 }
      );
    }

    const movedCount = await StrategyOrganizationService.bulkMoveStrategies(
      strategyIds,
      folderId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: { movedCount },
      message: `Successfully moved ${movedCount} strategies`,
    });
  } catch (error) {
    console.error('Error bulk moving strategies:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}