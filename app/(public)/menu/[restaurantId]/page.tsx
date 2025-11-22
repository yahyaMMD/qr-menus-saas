// @ts-nocheck
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Pricing from '@/components/Pricing'
import MenuShowcase from '@/components/MenuShowcase'
import Testimonials from '@/components/Testimonials'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

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
