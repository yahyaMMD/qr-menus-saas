import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/utils';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = generateSEOMetadata({
  title: 'About Us',
  description: 'Learn about QResto - transforming the dining experience with digital QR menus. Our mission is to help restaurants deliver modern, contactless service with beautiful digital menus, analytics, and multilingual support.',
  keywords: [
    'about QResto',
    'restaurant technology company',
    'digital menu platform',
    'QR menu solution',
    'restaurant software team',
  ],
  url: '/about',
  type: 'website',
});

export default function AboutPage() {
  return <AboutPageClient />;
}
