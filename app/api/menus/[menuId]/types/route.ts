import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById } from '@/lib/auth/db';

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

async function verifyMenuOwnership(menuId: string, userId: string) {
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    include: {
      profile: {
        select: { ownerId: true },
      },
    },
  });

  if (!menu) {
    return { error: 'Menu not found', status: 404 };
  }

  if (menu.profile.ownerId !== userId) {
    return { error: 'You do not have permission to modify this menu', status: 403 };
  }

  return { menu };
}

// GET - List all types in a menu
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId } = await params;

  try {
    const verification = await verifyMenuOwnership(menuId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    const types = await prisma.type.findMany({
      where: { menuId },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ types }, { status: 200 });
  } catch (error) {
    console.error('Get types error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch types' },
      { status: 500 }
    );
  }
}

const createTypeSchema = z.object({
  name: z.string().min(1, { message: 'Type name is required' }),
  image: z.string().url().optional().nullable(),
});

// POST - Create a new type
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId } = await params;

  try {
    const verification = await verifyMenuOwnership(menuId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
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

    const parseResult = createTypeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { name, image } = parseResult.data;

    const type = await prisma.type.create({
      data: {
        name,
        image: image || null,
        menuId,
      },
    });

    return NextResponse.json(
      {
        message: 'Type created successfully',
        type,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create type error:', error);
    return NextResponse.json(
      { error: 'Failed to create type' },
      { status: 500 }
    );
  }
}

