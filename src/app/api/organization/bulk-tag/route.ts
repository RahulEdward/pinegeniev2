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
    const { strategyIds, tags } = body;

    if (!strategyIds || !Array.isArray(strategyIds) || strategyIds.length === 0) {
      return NextResponse.json(
        { error: 'Strategy IDs are required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'Tags are required and must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate and clean tags
    const cleanTags = tags
      .map(tag => typeof tag === 'string' ? tag.trim().toLowerCase() : '')
      .filter(tag => tag.length > 0 && tag.length <= 50);

    if (cleanTags.length === 0) {
      return NextResponse.json(
        { error: 'No valid tags provided' },
        { status: 400 }
      );
    }

    const updatedCount = await StrategyOrganizationService.bulkAddTags(
      strategyIds,
      cleanTags,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: { updatedCount, addedTags: cleanTags },
      message: `Successfully added tags to ${updatedCount} strategies`,
    });
  } catch (error) {
    console.error('Error bulk adding tags:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}