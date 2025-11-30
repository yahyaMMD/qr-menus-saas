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

async function verifyCategoryOwnership(menuId: string, categoryId: string, userId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
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

  if (!category) {
    return { error: 'Category not found', status: 404 };
  }

  if (category.menuId !== menuId) {
    return { error: 'Category does not belong to this menu', status: 400 };
  }

  if (category.menu.profile.ownerId !== userId) {
    return { error: 'You do not have permission to modify this category', status: 403 };
  }

  return { category };
}

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { menuId: string; categoryId: string } }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  try {
    const verification = await verifyCategoryOwnership(params.menuId, params.categoryId, user.id);
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

    const parseResult = updateCategorySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const updatedCategory = await prisma.category.update({
      where: { id: params.categoryId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.image !== undefined && { image: data.image }),
      },
    });

    return NextResponse.json(
      {
        message: 'Category updated successfully',
        category: updatedCategory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { menuId: string; categoryId: string } }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  try {
    const verification = await verifyCategoryOwnership(params.menuId, params.categoryId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    const itemCount = await prisma.item.count({
      where: { categoryId: params.categoryId },
    });

    if (itemCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It contains ${itemCount} item(s). Please remove or reassign items first.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.categoryId },
    });

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
