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

// DELETE - Delete a tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; tagId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId, tagId } = await params;

  try {
    const verification = await verifyMenuOwnership(menuId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    // Check if tag exists
    const tag = await prisma.tag.findFirst({
      where: { id: tagId, menuId },
    });

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Delete all ItemTag relations for this tag
    await prisma.itemTag.deleteMany({
      where: { tagId },
    });

    // Delete the tag
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json(
      { message: 'Tag deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete tag error:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
}

// PATCH - Update a tag
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; tagId: string }> }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;
  const { menuId, tagId } = await params;

  try {
    const verification = await verifyMenuOwnership(menuId, user.id);
    if ('error' in verification) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status }
      );
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findFirst({
      where: { id: tagId, menuId },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: 'Tag not found' },
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

    const { name, color } = body as { name?: string; color?: string };

    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(name && { name }),
        ...(color && { color }),
      },
    });

    return NextResponse.json(
      { message: 'Tag updated successfully', tag },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update tag error:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

