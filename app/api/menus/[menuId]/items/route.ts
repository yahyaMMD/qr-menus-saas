import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth/middleware';
import { findUserById } from '@/lib/auth/db';
import { canAddItem } from '@/lib/plan-limits';

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

// GET - List all items in a menu
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

    const items = await prisma.item.findMany({
      where: { menuId },
      include: {
        category: {
          select: { id: true, name: true },
        },
        type: {
          select: { id: true, name: true },
        },
        itemTags: {
          include: {
            tag: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transform items to include tags as flat array
    const transformedItems = items.map(item => ({
      ...item,
      tags: item.itemTags.map(it => it.tag),
      itemTags: undefined,
    }));

    return NextResponse.json({ items: transformedItems }, { status: 200 });
  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

const createItemSchema = z.object({
  name: z.string().min(1, { message: 'Item name is required' }),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  typeId: z.string().optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  originalPrice: z.number().min(0).optional().nullable(),
  isPromotion: z.boolean().optional().default(false),
  tagIds: z.array(z.string()).optional().default([]),
});

// POST - Create a new item
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

    // Check plan limits
    const limitCheck = await canAddItem(user.id, menuId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message },
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

    const parseResult = createItemSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { name, description, image, categoryId, typeId, price, originalPrice, isPromotion, tagIds } = parseResult.data;

    // Validate category belongs to this menu
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, menuId },
      });
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found in this menu' },
          { status: 400 }
        );
      }
    }

    // Validate type belongs to this menu
    if (typeId) {
      const type = await prisma.type.findFirst({
        where: { id: typeId, menuId },
      });
      if (!type) {
        return NextResponse.json(
          { error: 'Type not found in this menu' },
          { status: 400 }
        );
      }
    }

    // Create item with tags
    const item = await prisma.item.create({
      data: {
        name,
        description: description || null,
        image: image || null,
        categoryId: categoryId || null,
        typeId: typeId || null,
        price: price || null,
        originalPrice: isPromotion ? originalPrice : null,
        isPromotion: isPromotion || false,
        menuId,
        itemTags: {
          create: tagIds.map(tagId => ({
            tagId,
          })),
        },
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
        type: {
          select: { id: true, name: true },
        },
        itemTags: {
          include: {
            tag: {
              select: { id: true, name: true, color: true },
            },
          },
        },
      },
    });

    // Transform to include tags as flat array
    const transformedItem = {
      ...item,
      tags: item.itemTags.map(it => it.tag),
      itemTags: undefined,
    };

    return NextResponse.json(
      {
        message: 'Item created successfully',
        item: transformedItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create item error:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}

