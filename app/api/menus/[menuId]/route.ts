import { NextRequest, NextResponse } from 'next/server';
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
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        profile: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        categories: {
          include: {
            items: true,
          },
        },
        items: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    if (menu.profile.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to view this menu' },
        { status: 403 }
      );
    }

    return NextResponse.json(menu, { status: 200 });
  } catch (error) {
    console.error('Get menu error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

// PATCH - Update menu (e.g., toggle active status)
export async function PATCH(
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
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        profile: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    if (menu.profile.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this menu' },
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

    const { isActive, name, description } = body as any;

    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(
      {
        message: 'Menu updated successfully',
        menu: updatedMenu,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update menu error:', error);
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu
export async function DELETE(
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
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        profile: {
          select: {
            ownerId: true,
          },
        },
        _count: {
          select: {
            items: true,
            categories: true,
          },
        },
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    if (menu.profile.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this menu' },
        { status: 403 }
      );
    }

    // Delete related data first
    await prisma.$transaction([
      // Delete item tags
      prisma.itemTag.deleteMany({
        where: {
          item: {
            menuId: menuId,
          },
        },
      }),
      // Delete items
      prisma.item.deleteMany({
        where: { menuId: menuId },
      }),
      // Delete categories
      prisma.category.deleteMany({
        where: { menuId: menuId },
      }),
      // Delete types
      prisma.type.deleteMany({
        where: { menuId: menuId },
      }),
      // Delete tags
      prisma.tag.deleteMany({
        where: { menuId: menuId },
      }),
      // Delete analytics
      prisma.analytics.deleteMany({
        where: { menuId: menuId },
      }),
      // Finally delete the menu
      prisma.menu.delete({
        where: { id: menuId },
      }),
    ]);

    return NextResponse.json(
      { message: 'Menu deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete menu error:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    );
  }
}
