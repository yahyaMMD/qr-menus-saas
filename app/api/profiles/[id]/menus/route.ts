import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById } from '@/lib/auth/db';
import { canCreateMenu } from '@/lib/plan-limits';

const prisma = new PrismaClient();

async function getAuthenticatedUser(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  if (!authResult.success || !authResult.payload) {
    return {
      response: NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  const user = await findUserById(authResult.payload.userId);
  if (!user) {
    return {
      response: NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      ),
    };
  }

  return { user };
}

// GET all menus for a profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { id } = await params;

  try {
    // Verify profile ownership
    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to view these menus' },
        { status: 403 }
      );
    }

    // Fetch menus
    const menus = await prisma.menu.findMany({
      where: { profileId: id },
      include: {
        _count: {
          select: {
            items: true,
            categories: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ menus }, { status: 200 });
  } catch (error) {
    console.error('Get menus error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    );
  }
}

// POST create new menu for a profile
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { id } = await params;

  try {
    // Verify profile ownership
    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to create menus for this profile' },
        { status: 403 }
      );
    }

    // Check plan limits for menu creation
    const menuCheck = await canCreateMenu(user.id, id);
    if (!menuCheck.allowed) {
      return NextResponse.json(
        { 
          error: menuCheck.message,
          limitReached: true,
          current: menuCheck.current,
          max: menuCheck.max
        },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { name, description, isActive } = body as any;

    if (!name) {
      return NextResponse.json(
        { error: 'Menu name is required' },
        { status: 400 }
      );
    }

    // Create menu
    const menu = await prisma.menu.create({
      data: {
        name,
        description: description || null,
        isActive: isActive || false,
        profileId: id,
      },
    });

    return NextResponse.json(
      {
        message: 'Menu created successfully',
        menu,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create menu error:', error);
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    );
  }
}
