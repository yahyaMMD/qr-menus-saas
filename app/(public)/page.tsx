import type { Metadata } from 'next';
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import Pricing from '@/components/landing/Pricing'
import MenuShowcase from '@/components/landing/MenuShowcase'
import Testimonials from '@/components/landing/Testimonials'
import { Contact } from '@/components/landing/Contact'
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema } from '@/lib/seo/utils';

export const metadata: Metadata = generateSEOMetadata({
  title: 'QResto | Digital Menu Platform for Modern Restaurants',
  description: 'Create, customize, and share digital menus with QR codes, analytics, multi-language support, and easy updates. The best solution for contactless dining. Perfect for restaurants, cafes, and food businesses.',
  keywords: [
    'QR menu',
    'digital menu',
    'restaurant menu app',
    'contactless menu',
    'qr code menu',
    'menu analytics',
    'SaaS for restaurants',
    'multilingual menu',
    'online menu',
    'restaurant technology',
    'food ordering system',
  ],
  url: '/',
  type: 'website',
});

export default function Home() {
  const organizationSchema = generateOrganizationSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <main className="min-h-screen bg-white">
        <Hero />
        <HowItWorks />
        <Pricing />
        <MenuShowcase />
        <Testimonials />
        <Contact />
      </main>
    </>
  )
}
