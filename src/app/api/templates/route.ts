import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { templateAccessService } from '@/services/subscription/TemplateAccessService';

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
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const isOfficial = searchParams.get('isOfficial');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (isOfficial !== null && isOfficial !== undefined) {
      where.isOfficial = isOfficial === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get templates with pagination
    const [templates, totalCount] = await Promise.all([
      prisma.strategyTemplate.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          tags: true,
          difficulty: true,
          isOfficial: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              strategies: true,
            }
          }
        },
      }),
      prisma.strategyTemplate.count({ where }),
    ]);

    // Parse tags and filter by tags if specified
    let filteredTemplates = templates.map(template => ({
      ...template,
      tags: template.tags ? JSON.parse(template.tags) : [],
    }));

    // Client-side tag filtering (since SQLite JSON queries are limited)
    if (tags && tags.length > 0) {
      filteredTemplates = filteredTemplates.filter(template => 
        tags.some(tag => template.tags.includes(tag))
      );
    }

    // Apply subscription-based filtering
    filteredTemplates = await templateAccessService.filterTemplatesBySubscription(
      session.user.id, 
      filteredTemplates
    );

    // Get available filter options
    const [categories, difficulties, popularTags] = await Promise.all([
      prisma.strategyTemplate.findMany({
        select: { category: true },
        distinct: ['category'],
      }),
      prisma.strategyTemplate.findMany({
        select: { difficulty: true },
        distinct: ['difficulty'],
      }),
      getPopularTemplateTags(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        templates: filteredTemplates,
        pagination: {
          page,
          limit,
          totalCount: filteredTemplates.length,
          totalPages: Math.ceil(filteredTemplates.length / limit),
        },
        filters: {
          categories: categories.map(c => c.category),
          difficulties: difficulties.map(d => d.difficulty),
          popularTags,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
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
    const { 
      name, 
      description, 
      category, 
      nodes, 
      connections, 
      tags, 
      difficulty,
      isOfficial 
    } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Template name is required' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Template description is required' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        { error: 'Template category is required' },
        { status: 400 }
      );
    }

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: 'Template nodes are required and must be an array' },
        { status: 400 }
      );
    }

    if (!connections || !Array.isArray(connections)) {
      return NextResponse.json(
        { error: 'Template connections are required and must be an array' },
        { status: 400 }
      );
    }

    if (difficulty && !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Difficulty must be one of: beginner, intermediate, advanced' },
        { status: 400 }
      );
    }

    // Check if template name already exists
    const existingTemplate = await prisma.strategyTemplate.findFirst({
      where: {
        name: name.trim(),
      },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'A template with this name already exists' },
        { status: 409 }
      );
    }

    // Only admins can create official templates
    // For now, we'll assume all templates are non-official unless explicitly set by admin
    const templateIsOfficial = false; // This would be determined by user role in a real implementation

    const template = await prisma.strategyTemplate.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        nodes: JSON.stringify(nodes),
        connections: JSON.stringify(connections),
        tags: tags ? JSON.stringify(tags) : null,
        difficulty: difficulty || 'beginner',
        isOfficial: templateIsOfficial,
      },
    });

    // Parse the response data
    const responseTemplate = {
      ...template,
      nodes: JSON.parse(template.nodes as string),
      connections: JSON.parse(template.connections as string),
      tags: template.tags ? JSON.parse(template.tags) : [],
    };

    return NextResponse.json({
      success: true,
      data: responseTemplate,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getPopularTemplateTags() {
  const allTemplates = await prisma.strategyTemplate.findMany({
    select: { tags: true },
  });

  const tagCounts: { [key: string]: number } = {};
  allTemplates.forEach(template => {
    if (template.tags) {
      const templateTags = JSON.parse(template.tags);
      templateTags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([tag]) => tag);
}