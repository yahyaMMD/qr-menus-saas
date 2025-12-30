import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://qresto.com';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = '/assets/hero.jpg',
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    noindex = false,
    nofollow = false,
  } = config;

  const fullTitle = title.includes('QResto') ? title : `${title} | QResto`;
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'QResto',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US', // for now we are supporting only Englihs, but we will add FR and Arabic later
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@qresto',
    },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateStructuredData(data: {
  type: 'Organization' | 'Restaurant' | 'Menu' | 'MenuItem' | 'BreadcrumbList';
  data: Record<string, any>;
}) {
  const { type, data: structuredData } = data;

  const baseStructure: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': type,
    ...structuredData,
  };

  return baseStructure;
}

export function generateOrganizationSchema() {
  return generateStructuredData({
    type: 'Organization',
    data: {
      name: 'QResto',
      url: baseUrl,
      logo: `${baseUrl}/assets/hero.jpg`,
      description: 'Digital Menu Platform for Modern Restaurants',
      sameAs: [
        // Here we will add the social media links, for now, there are not.
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'support@qresto.com',
      },
    },
  });
}

export function generateRestaurantSchema(restaurant: {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
  image?: string;
}) {
  return generateStructuredData({
    type: 'Restaurant',
    data: {
      name: restaurant.name,
      description: restaurant.description || `${restaurant.name} - View our digital menu`,
      ...(restaurant.address && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: restaurant.address,
        },
      }),
      ...(restaurant.phone && { telephone: restaurant.phone }),
      ...(restaurant.website && { url: restaurant.website }),
      ...(restaurant.image && {
        image: restaurant.image.startsWith('http') ? restaurant.image : `${baseUrl}${restaurant.image}`,
      }),
      servesCuisine: 'Various',
    },
  });
}

export function generateMenuSchema(menu: {
  name: string;
  description?: string;
  restaurantName: string;
  items: Array<{
    name: string;
    description?: string;
    price?: number;
    image?: string;
  }>;
}) {
  return generateStructuredData({
    type: 'Menu',
    data: {
      name: menu.name,
      description: menu.description || `${menu.name} - Digital Menu`,
      provider: {
        '@type': 'Restaurant',
        name: menu.restaurantName,
      },
      hasMenuSection: menu.items.map((item) => ({
        '@type': 'MenuItem',
        name: item.name,
        description: item.description,
        ...(item.price && {
          offers: {
            '@type': 'Offer',
            price: item.price,
            priceCurrency: 'DZD',
          },
        }),
        ...(item.image && {
          image: item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`,
        }),
      })),
    },
  });
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return generateStructuredData({
    type: 'BreadcrumbList',
    data: {
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
      })),
    },
  });
}

