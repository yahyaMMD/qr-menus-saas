import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'
import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Navbar/>
      <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4"
      >
      {children}
      </div>
      <Footer/>
    </div>
  )
}
