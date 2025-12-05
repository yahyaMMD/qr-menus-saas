import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Public API - no authentication required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const { menuId } = await params;

  try {
    // Fetch menu with all related data
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        profile: {
          select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            socialLinks: true,
            location: true,
            phone: true,
            email: true,
            website: true,
          },
        },
        categories: {
          orderBy: { name: 'asc' },
        },
        types: {
          orderBy: { name: 'asc' },
        },
        tags: {
          orderBy: { name: 'asc' },
        },
        items: {
          include: {
            itemTags: {
              select: {
                tagId: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    // Check if menu is active
    if (!menu.isActive) {
      return NextResponse.json(
        { error: 'This menu is not currently available' },
        { status: 404 }
      );
    }

    // Transform items to include tag IDs as flat array
    const transformedItems = menu.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
      categoryId: item.categoryId,
      typeId: item.typeId,
      menuId: item.menuId,
      price: item.price,
      originalPrice: item.originalPrice,
      isPromotion: item.isPromotion,
      tags: item.itemTags.map(it => it.tagId),
    }));

    // Format response
    const response = {
      menu: {
        id: menu.id,
        name: menu.name,
        logoUrl: menu.profile.logo || '/placeholder-logo.png',
        description: menu.description,
      },
      restaurant: {
        id: menu.profile.id,
        name: menu.profile.name,
        description: menu.profile.description,
        socialLinks: menu.profile.socialLinks,
        location: menu.profile.location,
        phone: menu.profile.phone,
        email: menu.profile.email,
        website: menu.profile.website,
      },
      items: transformedItems,
      categories: menu.categories.map(c => ({
        id: c.id,
        name: c.name,
        image: c.image,
        menuId: c.menuId,
      })),
      types: menu.types.map(t => ({
        id: t.id,
        name: t.name,
        image: t.image,
        menuId: t.menuId,
      })),
      tags: menu.tags.map(t => ({
        id: t.id,
        name: t.name,
        color: t.color,
        menuId: t.menuId,
      })),
    };

    // Track scan (analytics)
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.analytics.upsert({
        where: {
          menuId_date: {
            menuId: menu.id,
            date: today,
          },
        },
        update: {
          scans: { increment: 1 },
        },
        create: {
          menuId: menu.id,
          date: today,
          scans: 1,
        },
      });
    } catch (analyticsError) {
      // Don't fail the request if analytics tracking fails
      console.error('Analytics tracking error:', analyticsError);
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Get public menu error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

