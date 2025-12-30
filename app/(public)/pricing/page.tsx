import type { Metadata } from 'next';
import { PricingPage } from "../../../components/pricing/PricingPage";
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/utils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Pricing Plans',
  description: 'Choose the perfect plan for your restaurant. Flexible pricing options for digital menus with QR codes, analytics, and multilingual support. Start free or upgrade for advanced features.',
  keywords: [
    'menu pricing',
    'restaurant software pricing',
    'QR menu cost',
    'digital menu plans',
    'restaurant SaaS pricing',
    'menu management pricing',
  ],
  url: '/pricing',
  type: 'website',
});

export default function Pricing() {
  return <PricingPage />;
}
