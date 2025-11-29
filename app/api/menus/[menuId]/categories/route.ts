import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById } from '@/lib/auth/db';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { menuId: string } }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  try {
    const verification = await verifyMenuOwnership(params.menuId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    const categories = await prisma.category.findMany({
      where: { menuId: params.menuId },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

const createCategorySchema = z.object({
  name: z.string().min(1, { message: 'Category name is required' }),
  image: z.string().url().optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { menuId: string } }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  try {
    const verification = await verifyMenuOwnership(params.menuId, user.id);
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

    const parseResult = createCategorySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { name, image } = parseResult.data;

    const category = await prisma.category.create({
      data: {
        name,
        image: image || null,
        menuId: params.menuId,
      },
    });

    return NextResponse.json(
      {
        message: 'Category created successfully',
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
