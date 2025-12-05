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

async function verifyItemOwnership(menuId: string, itemId: string, userId: string) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      menu: {
        include: {
          profile: {
            select: { ownerId: true },
          },
        },
      },
    },
  });

  if (!item) {
    return { error: 'Item not found', status: 404 };
  }

  if (item.menuId !== menuId) {
    return { error: 'Item does not belong to this menu', status: 400 };
  }

  if (item.menu.profile.ownerId !== userId) {
    return { error: 'You do not have permission to modify this item', status: 403 };
  }

  return { item };
}

// GET - Get a single item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; itemId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId, itemId } = await params;

  try {
    const verification = await verifyItemOwnership(menuId, itemId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
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

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const transformedItem = {
      ...item,
      tags: item.itemTags.map(it => it.tag),
      itemTags: undefined,
    };

    return NextResponse.json({ item: transformedItem }, { status: 200 });
  } catch (error) {
    console.error('Get item error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  typeId: z.string().optional().nullable(),
  price: z.number().min(0).optional().nullable(),
  originalPrice: z.number().min(0).optional().nullable(),
  isPromotion: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

// PATCH - Update an item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; itemId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId, itemId } = await params;

  try {
    const verification = await verifyItemOwnership(menuId, itemId, user.id);
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

    const parseResult = updateItemSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Validate category belongs to this menu
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, menuId },
      });
      if (!category) {
        return NextResponse.json(
          { error: 'Category not found in this menu' },
          { status: 400 }
        );
      }
    }

    // Validate type belongs to this menu
    if (data.typeId) {
      const type = await prisma.type.findFirst({
        where: { id: data.typeId, menuId },
      });
      if (!type) {
        return NextResponse.json(
          { error: 'Type not found in this menu' },
          { status: 400 }
        );
      }
    }

    // Update tags if provided
    if (data.tagIds !== undefined) {
      // Delete existing item tags
      await prisma.itemTag.deleteMany({
        where: { itemId },
      });

      // Create new item tags
      if (data.tagIds.length > 0) {
        await prisma.itemTag.createMany({
          data: data.tagIds.map(tagId => ({
            itemId,
            tagId,
          })),
        });
      }
    }

    // Update the item
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.typeId !== undefined && { typeId: data.typeId }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.isPromotion !== undefined && { isPromotion: data.isPromotion }),
        ...(data.originalPrice !== undefined && { originalPrice: data.isPromotion ? data.originalPrice : null }),
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

    const transformedItem = {
      ...updatedItem,
      tags: updatedItem.itemTags.map(it => it.tag),
      itemTags: undefined,
    };

    return NextResponse.json(
      {
        message: 'Item updated successfully',
        item: transformedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update item error:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; itemId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId, itemId } = await params;

  try {
    const verification = await verifyItemOwnership(menuId, itemId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    // Delete item tags first
    await prisma.itemTag.deleteMany({
      where: { itemId },
    });

    // Delete the item
    await prisma.item.delete({
      where: { id: itemId },
    });

    return NextResponse.json(
      { message: 'Item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

