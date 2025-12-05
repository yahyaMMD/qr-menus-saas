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

// GET single profile by ID (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        menus: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  logo: z.string().url().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  wifiName: z.string().optional(),
  wifiPassword: z.string().optional(),
  mapUrl: z.string().url().optional(),
  location: z.any().optional(),
  socialLinks: z.any().optional(),
  businessHours: z.any().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  try {
    // Verify ownership
    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this profile' },
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

    const parseResult = updateProfileSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.format() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.wifiName !== undefined && { wifiName: data.wifiName }),
        ...(data.wifiPassword !== undefined && { wifiPassword: data.wifiPassword }),
        ...(data.mapUrl !== undefined && { mapUrl: data.mapUrl }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.socialLinks !== undefined && { socialLinks: data.socialLinks }),
        ...(data.businessHours !== undefined && { businessHours: data.businessHours }),
      },
    });

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        profile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const result = await getAuthenticatedUser(request);
  if ('response' in result) {
    return result.response;
  }

  const { user } = result;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        menus: {
          select: { id: true },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Only the owner can delete the profile
    if (profile.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Only the profile owner can delete this restaurant' },
        { status: 403 }
      );
    }

    // Get all menu IDs for cascade deletion
    const menuIds = profile.menus.map((m) => m.id);

    // Delete in order to respect foreign key constraints
    // 1. Delete translations for all menus
    if (menuIds.length > 0) {
      await prisma.translation.deleteMany({
        where: { menuId: { in: menuIds } },
      });

      // 2. Delete ItemTags for items in these menus
      const items = await prisma.item.findMany({
        where: { menuId: { in: menuIds } },
        select: { id: true },
      });
      const itemIds = items.map((i) => i.id);

      if (itemIds.length > 0) {
        await prisma.itemTag.deleteMany({
          where: { itemId: { in: itemIds } },
        });
      }

      // 3. Delete items
      await prisma.item.deleteMany({
        where: { menuId: { in: menuIds } },
      });

      // 4. Delete categories, tags, types
      await prisma.category.deleteMany({
        where: { menuId: { in: menuIds } },
      });

      await prisma.tag.deleteMany({
        where: { menuId: { in: menuIds } },
      });

      await prisma.type.deleteMany({
        where: { menuId: { in: menuIds } },
      });

      // 5. Delete analytics
      await prisma.analytics.deleteMany({
        where: { menuId: { in: menuIds } },
      });

      // 6. Delete menus
      await prisma.menu.deleteMany({
        where: { profileId: id },
      });
    }

    // 7. Delete feedbacks
    await prisma.feedback.deleteMany({
      where: { profileId: id },
    });

    // 8. Delete team members
    await prisma.teamMember.deleteMany({
      where: { profileId: id },
    });

    // 9. Finally, delete the profile
    await prisma.profile.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Restaurant profile and all related data deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete profile error:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile. Please try again.' },
      { status: 500 }
    );
  }
}
