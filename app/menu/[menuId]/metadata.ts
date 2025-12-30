import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { generateMetadata as generateSEOMetadata, generateRestaurantSchema, generateMenuSchema } from '@/lib/seo/utils';

export async function generateMenuMetadata(menuId: string): Promise<Metadata> {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        profile: {
          select: {
            name: true,
            description: true,
            logo: true,
            location: true,
            phone: true,
            website: true,
          },
        },
        items: {
          take: 10,
          select: {
            name: true,
            description: true,
            price: true,
            image: true,
          },
        },
      },
    });

    if (!menu || !menu.isActive) {
      return generateSEOMetadata({
        title: 'Menu Not Found',
        description: 'The menu you are looking for is not available.',
        noindex: true,
        nofollow: true,
      });
    }

    const restaurantName = menu.profile.name;
    const menuName = menu.name || `${restaurantName} Menu`;
    const description = menu.description || menu.profile.description || `View the digital menu for ${restaurantName}. Browse our delicious offerings with prices, descriptions, and images.`;

    return generateSEOMetadata({
      title: `${menuName} - ${restaurantName}`,
      description,
      keywords: [
        restaurantName,
        'digital menu',
        'QR menu',
        'restaurant menu',
        menu.name,
        'online menu',
      ],
      url: `/menu/${menuId}`,
      type: 'website',
      image: menu.profile.logo || undefined,
    });
  } catch (error) {
    console.error('Error generating menu metadata:', error);
    return generateSEOMetadata({
      title: 'Menu',
      description: 'View our digital menu',
    });
  }
}

export async function generateMenuStructuredData(menuId: string) {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        profile: {
          select: {
            name: true,
            description: true,
            logo: true,
            location: true,
            phone: true,
            website: true,
          },
        },
        items: {
          take: 20,
          select: {
            name: true,
            description: true,
            price: true,
            image: true,
          },
        },
      },
    });

    if (!menu || !menu.isActive) {
      return null;
    }

    const restaurantSchema = generateRestaurantSchema({
      name: menu.profile.name,
      description: menu.profile.description || undefined,
      address: typeof menu.profile.location === 'string' ? menu.profile.location : undefined,
      phone: menu.profile.phone || undefined,
      website: menu.profile.website || undefined,
      image: menu.profile.logo || undefined,
    });

    const menuSchema = generateMenuSchema({
      name: menu.name || `${menu.profile.name} Menu`,
      description: menu.description || undefined,
      restaurantName: menu.profile.name,
      items: menu.items.map(item => ({
        name: item.name,
        description: item.description || undefined,
        price: item.price || undefined,
        image: item.image || undefined,
      })),
    });

    return [restaurantSchema, menuSchema];
  } catch (error) {
    console.error('Error generating menu structured data:', error);
    return null;
  }
}

