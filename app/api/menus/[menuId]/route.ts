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
  { params }: { params: { menuId: string } }
) {
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  try {
    const menu = await prisma.menu.findUnique({
      where: { id: params.menuId },
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
