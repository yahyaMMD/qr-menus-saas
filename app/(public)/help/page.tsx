import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/utils';
import HelpPageClient from './HelpPageClient';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Help Center',
  description: 'Find answers to frequently asked questions about QResto digital menu platform. Learn how to create menus, generate QR codes, manage analytics, and more.',
  keywords: [
    'QResto help',
    'digital menu help',
    'QR menu guide',
    'restaurant software support',
    'menu management FAQ',
  ],
  url: '/help',
  type: 'website',
});

export default function HelpCenterPage() {
  return <HelpPageClient />;
}
