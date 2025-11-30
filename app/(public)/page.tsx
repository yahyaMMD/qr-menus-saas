// @ts-nocheck
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import Pricing from '@/components/landing/Pricing'
import MenuShowcase from '@/components/landing/MenuShowcase'
import Testimonials from '@/components/landing/Testimonials'
import CTA from '@/components/landing/CTA'
import { Contact } from '@/components/landing/Contact'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <HowItWorks />
      <Pricing />
      <MenuShowcase />
      <Contact />
      <Testimonials />
      <CTA />
    </main>
  )
}
