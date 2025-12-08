// @ts-nocheck
import Hero from '@/components/landing/Hero'
import HowItWorks from '@/components/landing/HowItWorks'
import Pricing from '@/components/landing/Pricing'
import MenuShowcase from '@/components/landing/MenuShowcase'
import Testimonials from '@/components/landing/Testimonials'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'
import { Contact } from '@/components/landing/Contact'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Pricing />
      <MenuShowcase />
      <Testimonials />
      <Contact />
      <CTA />
      <Footer />
    </main>
  )
}
