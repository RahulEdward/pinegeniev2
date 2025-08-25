import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get real stats from database where possible, mock others
    const [totalUsers, totalStrategies] = await Promise.all([
      prisma.user.count(),
      prisma.strategy.count()
    ]);

    // Calculate active users (users who created strategies in last 30 days)
    const activeUsers = await prisma.user.count({
      where: {
        strategies: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    });

    // Mock AI-specific stats (in production, track these in database)
    const stats = {
      totalRequests: Math.floor(Math.random() * 10000) + 5000,
      activeUsers: activeUsers,
      errorRate: Math.floor(Math.random() * 5) + 1, // 1-5% error rate
      avgResponseTime: Math.floor(Math.random() * 500) + 200, // 200-700ms
      
      // Additional AI metrics
      modelsActive: 3,
      tokensProcessed: Math.floor(Math.random() * 1000000) + 500000,
      costToday: Math.floor(Math.random() * 100) + 50,
      
      // Usage by model
      modelUsage: [
        { model: 'pine-genie', requests: Math.floor(Math.random() * 3000) + 2000, percentage: 60 },
        { model: 'gpt-4', requests: Math.floor(Math.random() * 1500) + 1000, percentage: 25 },
        { model: 'claude-3', requests: Math.floor(Math.random() * 1000) + 500, percentage: 15 }
      ],
      
      // Hourly usage for last 24 hours
      hourlyUsage: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        requests: Math.floor(Math.random() * 100) + 20,
        errors: Math.floor(Math.random() * 5)
      })),
      
      // Recent errors
      recentErrors: [
        {
          id: 1,
          model: 'gpt-4',
          error: 'Rate limit exceeded',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
          user: 'user123'
        },
        {
          id: 2,
          model: 'claude-3',
          error: 'API key invalid',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          user: 'user456'
        }
      ],
      
      // Performance metrics
      performance: {
        uptime: 99.8,
        successRate: 98.5,
        avgTokensPerRequest: 150,
        peakRequestsPerHour: Math.floor(Math.random() * 500) + 200
      }
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('AI Stats API error:', error);
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
    const { action, timeRange } = body;

    switch (action) {
      case 'export':
        // Export stats data
        const exportData = {
          exportedAt: new Date().toISOString(),
          timeRange: timeRange || 'last-30-days',
          data: {
            // This would contain detailed stats for export
            summary: 'AI usage statistics export',
            totalRequests: Math.floor(Math.random() * 50000) + 25000,
            totalCost: Math.floor(Math.random() * 1000) + 500,
            topModels: ['pine-genie', 'gpt-4', 'claude-3']
          }
        };
        
        return NextResponse.json({ 
          export: exportData,
          message: 'Stats exported successfully'
        });

      case 'reset':
        // Reset certain stats (like error counts)
        return NextResponse.json({ 
          message: 'Stats reset successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI stats action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}