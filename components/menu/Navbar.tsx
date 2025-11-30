// @ts-nocheck
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <button className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="text-xl font-bold text-gray-900">
              Qresto
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="#pricing" className="text-gray-700 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="#signin" className="text-gray-700 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="#get-started"
              className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-4">
            <Link href="#pricing" className="block text-gray-700 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="#signin" className="block text-gray-700 hover:text-gray-900">
              Sign in
            </Link>
            <Link
              href="#get-started"
              className="block bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition text-center"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
