import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuthAndLogging, addSecurityHeaders } from '@/middleware/admin';
import { SecurityEventService, logAdminAction } from '@/services/admin';

// Get security events with filtering
export const GET = withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') || undefined;
    const severity = searchParams.get('severity') || undefined;
    const resolved = searchParams.get('resolved') === 'true' ? true : 
                    searchParams.get('resolved') === 'false' ? false : undefined;
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

    const offset = (page - 1) * limit;

    const { events, total } = await SecurityEventService.findMany({
      type,
      severity,
      resolved,
      dateFrom,
      dateTo,
      limit,
      offset,
    });

    // Log admin action
    await logAdminAction(
      adminId,
      'VIEW_SECURITY_EVENTS',
      'SECURITY_AUDIT',
      undefined,
      { filters: { type, severity, resolved }, total },
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    );

    const response = NextResponse.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });

    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Admin security events fetch error:', error);
    const response = NextResponse.json(
      { success: false, message: 'Failed to fetch security events' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
});

// Resolve security event
export const POST = withAdminAuthAndLogging(async (request: NextRequest, adminId: string, adminUser: any) => {
  try {
    const body = await request.json();
    const { eventId, action } = body;

    if (action === 'resolve') {
      const resolvedEvent = await SecurityEventService.resolve(eventId, adminId);

      // Log admin action
      await logAdminAction(
        adminId,
        'RESOLVE_SECURITY_EVENT',
        'SECURITY_AUDIT',
        eventId,
        { eventType: resolvedEvent.type, severity: resolvedEvent.severity },
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      );

      const response = NextResponse.json({
        success: true,
        data: resolvedEvent,
        message: 'Security event resolved successfully',
      });

      return addSecurityHeaders(response);
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Admin security event action error:', error);
    const response = NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Security event action failed' 
      },
      { status: 400 }
    );
    return addSecurityHeaders(response);
  }
});