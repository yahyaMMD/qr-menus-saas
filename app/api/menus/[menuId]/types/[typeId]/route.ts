import { NextRequest, NextResponse } from 'next/server';
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

// DELETE - Delete a type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; typeId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId, typeId } = await params;

  try {
    const verification = await verifyMenuOwnership(menuId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    // Check if type exists
    const type = await prisma.type.findFirst({
      where: { id: typeId, menuId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!type) {
      return NextResponse.json(
        { error: 'Type not found' },
        { status: 404 }
      );
    }

    // Update items to remove type reference
    await prisma.item.updateMany({
      where: { typeId },
      data: { typeId: null },
    });

    // Delete the type
    await prisma.type.delete({
      where: { id: typeId },
    });

    return NextResponse.json(
      { message: 'Type deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete type error:', error);
    return NextResponse.json(
      { error: 'Failed to delete type' },
      { status: 500 }
    );
  }
}

// PATCH - Update a type
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; typeId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId, typeId } = await params;

  try {
    const verification = await verifyMenuOwnership(menuId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    // Check if type exists
    const existingType = await prisma.type.findFirst({
      where: { id: typeId, menuId },
    });

    if (!existingType) {
      return NextResponse.json(
        { error: 'Type not found' },
        { status: 404 }
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

    const { name, image } = body as { name?: string; image?: string | null };

    const type = await prisma.type.update({
      where: { id: typeId },
      data: {
        ...(name && { name }),
        ...(image !== undefined && { image: image || null }),
      },
    });

    return NextResponse.json(
      { message: 'Type updated successfully', type },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update type error:', error);
    return NextResponse.json(
      { error: 'Failed to update type' },
      { status: 500 }
    );
  }
}

