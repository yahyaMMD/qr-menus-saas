import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';

// Public API - no authentication required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const { menuId } = await params;
  const { searchParams } = new URL(request.url);
  const requestedLang = searchParams.get('lang');

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
        translations: true,
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

    // Determine current language
    const currentLang = requestedLang && menu.supportedLanguages.includes(requestedLang) 
      ? requestedLang 
      : menu.defaultLanguage;

    // Create translation lookup map
    const translationMap = new Map<string, string>();
    for (const t of menu.translations) {
      if (t.languageCode === currentLang) {
        const key = `${t.entityType}:${t.entityId}:${t.field}`;
        translationMap.set(key, t.value);
      }
    }

    // Helper to get translated value
    const getTranslated = (entityType: string, entityId: string, field: string, defaultValue: string | null) => {
      if (currentLang === menu.defaultLanguage) return defaultValue;
      const key = `${entityType}:${entityId}:${field}`;
      return translationMap.get(key) || defaultValue;
    };

    // Transform items with translations
    const transformedItems = menu.items.map(item => ({
      id: item.id,
      name: getTranslated('item', item.id, 'name', item.name) || item.name,
      description: getTranslated('item', item.id, 'description', item.description),
      image: item.image,
      categoryId: item.categoryId,
      typeId: item.typeId,
      menuId: item.menuId,
      price: item.price,
      originalPrice: item.originalPrice,
      isPromotion: item.isPromotion,
      tags: item.itemTags.map(it => it.tagId),
    }));

    // Format response with translations
    const response = {
      menu: {
        id: menu.id,
        name: getTranslated('menu', menu.id, 'name', menu.name) || menu.name,
        logoUrl: menu.profile.logo || '/placeholder-logo.png',
        description: getTranslated('menu', menu.id, 'description', menu.description),
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
        name: getTranslated('category', c.id, 'name', c.name) || c.name,
        image: c.image,
        menuId: c.menuId,
      })),
      types: menu.types.map(t => ({
        id: t.id,
        name: getTranslated('type', t.id, 'name', t.name) || t.name,
        image: t.image,
        menuId: t.menuId,
      })),
      tags: menu.tags.map(t => ({
        id: t.id,
        name: getTranslated('tag', t.id, 'name', t.name) || t.name,
        color: t.color,
        menuId: t.menuId,
      })),
      // Language info for frontend
      languages: {
        current: currentLang,
        default: menu.defaultLanguage,
        supported: menu.supportedLanguages,
        availableLanguages: SUPPORTED_LANGUAGES.filter(l => menu.supportedLanguages.includes(l.code)),
      },
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

