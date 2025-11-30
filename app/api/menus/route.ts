import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest } from '@/lib/auth/middleware';
import { Role } from '@/lib/auth/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validation schemas
const createMenuSchema = z.object({
  profileId: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional().default(false),
});

const updateMenuSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

const createCategorySchema = z.object({
  menuId: z.string().min(1),
  name: z.string().min(1).max(100),
  image: z.string().optional(),
});

const createTypeSchema = z.object({
  menuId: z.string().min(1),
  name: z.string().min(1).max(100),
  image: z.string().optional(),
});

// Helper function
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

  return { userId: authResult.payload.userId, role: authResult.payload.role };
}

// GET - Fetch menus for a profile
export async function GET(request: NextRequest) {
  try {
    const result = await getAuthenticatedUser(request);
    if ('response' in result) return result.response;

    const { userId, role } = result;
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const menuId = searchParams.get('menuId');

    // Fetch single menu
    if (menuId) {
      const menu = await prisma.menu.findUnique({
        where: { id: menuId },
        include: {
          profile: true,
          categories: {
            orderBy: { name: 'asc' }
          },
          types: {
            orderBy: { name: 'asc' }
          },
          tags: {
            orderBy: { name: 'asc' }
          },
          items: {
            include: {
              category: true,
              type: true
            },
            orderBy: { name: 'asc' }
          }
        }
      });

      if (!menu) {
        return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
      }

      // Check ownership
      if (menu.profile.ownerId !== userId && role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      return NextResponse.json(menu);
    }

    // Fetch all menus for a profile
    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId is required' },
        { status: 400 }
      );
    }

    // Verify profile ownership
    const profile = await prisma.profile.findUnique({
      where: { id: profileId }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (profile.ownerId !== userId && role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const menus = await prisma.menu.findMany({
      where: { profileId },
      include: {
        categories: true,
        types: true,
        items: true,
        _count: {
          select: {
            items: true,
            analytics: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(menus);
  } catch (error) {
    console.error('Menus GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create menu, category, or type
export async function POST(request: NextRequest) {
  try {
    const result = await getAuthenticatedUser(request);
    if ('response' in result) return result.response;

    const { userId, role } = result;

    if (role !== Role.RESTAURANT_OWNER && role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'menu', 'category', 'type'

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // CREATE MENU
    if (action === 'menu' || !action) {
      const parseResult = createMenuSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: parseResult.error.issues[0].message },
          { status: 400 }
        );
      }

      const data = parseResult.data;

      // Verify profile ownership
      const profile = await prisma.profile.findUnique({
        where: { id: data.profileId }
      });

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      if (profile.ownerId !== userId && role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const menu = await prisma.menu.create({
        data: {
          profileId: data.profileId,
          name: data.name,
          description: data.description,
          isActive: data.isActive
        },
        include: {
          categories: true,
          types: true,
          items: true
        }
      });

      return NextResponse.json(menu, { status: 201 });
    }

    // CREATE CATEGORY
    if (action === 'category') {
      const parseResult = createCategorySchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: parseResult.error.issues[0].message },
          { status: 400 }
        );
      }

      const data = parseResult.data;

      // Verify menu ownership
      const menu = await prisma.menu.findUnique({
        where: { id: data.menuId },
        include: { profile: true }
      });

      if (!menu) {
        return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
      }

      if (menu.profile.ownerId !== userId && role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const category = await prisma.category.create({
        data: {
          menuId: data.menuId,
          name: data.name,
          image: data.image
        }
      });

      return NextResponse.json(category, { status: 201 });
    }

    // CREATE TYPE
    if (action === 'type') {
      const parseResult = createTypeSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: parseResult.error.issues[0].message },
          { status: 400 }
        );
      }

      const data = parseResult.data;

      // Verify menu ownership
      const menu = await prisma.menu.findUnique({
        where: { id: data.menuId },
        include: { profile: true }
      });

      if (!menu) {
        return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
      }

      if (menu.profile.ownerId !== userId && role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const type = await prisma.type.create({
        data: {
          menuId: data.menuId,
          name: data.name,
          image: data.image
        }
      });

      return NextResponse.json(type, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Menu POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update menu, category, or type
export async function PATCH(request: NextRequest) {
  try {
    const result = await getAuthenticatedUser(request);
    if ('response' in result) return result.response;

    const { userId, role } = result;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // UPDATE MENU
    if (action === 'menu' || !action) {
      const menu = await prisma.menu.findUnique({
        where: { id },
        include: { profile: true }
      });

      if (!menu) {
        return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
      }

      if (menu.profile.ownerId !== userId && role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const updatedMenu = await prisma.menu.update({
        where: { id },
        data: body as any
      });

      return NextResponse.json(updatedMenu);
    }

    // UPDATE CATEGORY
    if (action === 'category') {
      const category = await prisma.category.findUnique({
        where: { id },
        include: { menu: { include: { profile: true } } }
      });

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      if (category.menu.profile.ownerId !== userId && role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const updated = await prisma.category.update({
        where: { id },
        data: body as any
      });

      return NextResponse.json(updated);
    }

    // UPDATE TYPE
    if (action === 'type') {
      const type = await prisma.type.findUnique({
        where: { id },
        include: { menu: { include: { profile: true } } }
      });

      if (!type) {
        return NextResponse.json({ error: 'Type not found' }, { status: 404 });
      }

      if (type.menu.profile.ownerId !== userId && role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      const updated = await prisma.type.update({
        where: { id },
        data: body as any
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Menu PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete menu, category, or type
export async function DELETE(request: NextRequest) {
  try {
    const result = await getAuthenticatedUser(request);
    if ('response' in result) return result.response;

    const { userId, role } = result;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // DELETE MENU
    if (action === 'menu' || !action) {
      const menu = await prisma.menu.findUnique({
        where: { id },
        include: { profile: true }
      });

      if (!menu) {
        return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
      }

      if (menu.profile.ownerId !== userId && role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      await prisma.menu.delete({ where: { id } });
      return NextResponse.json({ message: 'Menu deleted successfully' });
    }

    // DELETE CATEGORY
    if (action === 'category') {
      const category = await prisma.category.findUnique({
        where: { id },
        include: { menu: { include: { profile: true } } }
      });

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      if (category.menu.profile.ownerId !== userId && role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      await prisma.category.delete({ where: { id } });
      return NextResponse.json({ message: 'Category deleted successfully' });
    }

    // DELETE TYPE
    if (action === 'type') {
      const type = await prisma.type.findUnique({
        where: { id },
        include: { menu: { include: { profile: true } } }
      });

      if (!type) {
        return NextResponse.json({ error: 'Type not found' }, { status: 404 });
      }

      if (type.menu.profile.ownerId !== userId && role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      await prisma.type.delete({ where: { id } });
      return NextResponse.json({ message: 'Type deleted successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Menu DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}