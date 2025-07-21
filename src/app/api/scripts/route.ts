import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get scripts with pagination
    const [scripts, totalCount] = await Promise.all([
      prisma.script.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          status: true,
          isPublic: true,
          tags: true,
          version: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.script.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        scripts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching scripts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { title, description, code, type, tags, status } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Default Pine Script v6 template if no code provided
    const defaultCode = code || `//@version=6
indicator("${title}", overlay=true)

// Your Pine Script v6 code will be generated here
plot(close, "Close", color=color.blue)`;

    const script = await prisma.script.create({
      data: {
        userId: session.user.id,
        title,
        description,
        code: defaultCode,
        type: type || 'INDICATOR',
        status: status || 'DRAFT',
        tags: tags ? JSON.stringify(tags) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: script,
    });
  } catch (error) {
    console.error('Error creating script:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}