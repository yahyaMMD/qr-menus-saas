// @ts-nocheck
import Hero from '@/components/menu/Hero'
import HowItWorks from '@/components/menu/HowItWorks'
import Pricing from '@/components/menu/Pricing'
import MenuShowcase from '@/components/menu/MenuShowcase'
import Testimonials from '@/components/menu/Testimonials'
import CTA from '@/components/menu/CTA'
import Footer from '@/components/menu/Footer'
import Navbar from '@/components/menu/Navbar'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Pricing />
      <MenuShowcase />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
