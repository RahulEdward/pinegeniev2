import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// In-memory storage for AI settings (in production, use database)
let aiSettings = {
  globalEnabled: true,
  defaultModel: 'pine-genie',
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 10,
    requestsPerHour: 100
  },
  contentFiltering: {
    enabled: true,
    strictMode: false
  },
  logging: {
    enabled: true,
    level: 'basic' as 'basic' | 'detailed' | 'debug'
  },
  autoModeration: {
    enabled: true,
    flagInappropriate: true,
    blockHarmful: true
  }
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ settings: aiSettings });
  } catch (error) {
    console.error('AI Settings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate settings structure
    const validatedSettings = {
      globalEnabled: body.globalEnabled ?? aiSettings.globalEnabled,
      defaultModel: body.defaultModel ?? aiSettings.defaultModel,
      rateLimiting: {
        enabled: body.rateLimiting?.enabled ?? aiSettings.rateLimiting.enabled,
        requestsPerMinute: body.rateLimiting?.requestsPerMinute ?? aiSettings.rateLimiting.requestsPerMinute,
        requestsPerHour: body.rateLimiting?.requestsPerHour ?? aiSettings.rateLimiting.requestsPerHour
      },
      contentFiltering: {
        enabled: body.contentFiltering?.enabled ?? aiSettings.contentFiltering.enabled,
        strictMode: body.contentFiltering?.strictMode ?? aiSettings.contentFiltering.strictMode
      },
      logging: {
        enabled: body.logging?.enabled ?? aiSettings.logging.enabled,
        level: body.logging?.level ?? aiSettings.logging.level
      },
      autoModeration: {
        enabled: body.autoModeration?.enabled ?? aiSettings.autoModeration.enabled,
        flagInappropriate: body.autoModeration?.flagInappropriate ?? aiSettings.autoModeration.flagInappropriate,
        blockHarmful: body.autoModeration?.blockHarmful ?? aiSettings.autoModeration.blockHarmful
      }
    };

    // Update settings
    aiSettings = validatedSettings;

    return NextResponse.json({ 
      settings: aiSettings,
      message: 'AI settings updated successfully'
    });
  } catch (error) {
    console.error('Update AI settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'reset':
        // Reset to default settings
        aiSettings = {
          globalEnabled: true,
          defaultModel: 'pine-genie',
          rateLimiting: {
            enabled: true,
            requestsPerMinute: 10,
            requestsPerHour: 100
          },
          contentFiltering: {
            enabled: true,
            strictMode: false
          },
          logging: {
            enabled: true,
            level: 'basic'
          },
          autoModeration: {
            enabled: true,
            flagInappropriate: true,
            blockHarmful: true
          }
        };
        return NextResponse.json({ 
          settings: aiSettings,
          message: 'AI settings reset to defaults'
        });

      case 'backup':
        // Return current settings as backup
        return NextResponse.json({ 
          backup: aiSettings,
          timestamp: new Date().toISOString(),
          message: 'Settings backup created'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI settings action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}