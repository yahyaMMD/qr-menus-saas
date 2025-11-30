// @ts-nocheck
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and get role
    const checkAuth = () => {
      try {
        const authRaw = localStorage.getItem('auth')
        if (authRaw) {
          const auth = JSON.parse(authRaw)
          if (auth?.tokens?.accessToken && auth?.user) {
            setIsAuthenticated(true)
            setUserRole(auth.user.role)
            
            // Redirect admin users to admin page
            if (auth.user.role === 'ADMIN' && window.location.pathname === '/') {
              router.push('/admin')
            }
          } else {
            setIsAuthenticated(false)
            setUserRole(null)
          }
        } else {
          setIsAuthenticated(false)
          setUserRole(null)
        }
      } catch (err) {
        setIsAuthenticated(false)
        setUserRole(null)
      }
    }

    checkAuth()
    // Listen for auth changes
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('auth')
    setIsAuthenticated(false)
    setUserRole(null)
    router.push('/')
  }

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
            <Link href="/about" className="text-gray-700 hover:text-orange-500 transition-colors">
              About
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-orange-500 transition-colors">
              Pricing
            </Link>
            <Link href="/legal/terms" className="text-gray-700 hover:text-orange-500 transition-colors">
              Terms
            </Link>
            <Link href="/legal/privacy" className="text-gray-700 hover:text-orange-500 transition-colors">
              Privacy
            </Link>
            <Link href="/help" className="text-gray-700 hover:text-orange-500 transition-colors">
              Help
            </Link>
            
            {isAuthenticated ? (
              <>
                {(userRole === 'RESTAURANT_OWNER' || userRole === 'USER') && (
                  <Link href="/dashboard" className="text-gray-700 hover:text-orange-500 transition-colors">
                    Dashboard
                  </Link>
                )}
                {userRole === 'ADMIN' && (
                  <Link href="/admin" className="text-gray-700 hover:text-orange-500 transition-colors">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-orange-500 transition-colors">
                  Sign in
                </Link>
                <Link href="/auth/register" className="text-gray-700 hover:text-orange-500 transition-colors">
                  Sign up
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-4">
            <Link href="/about" className="block text-gray-700 hover:text-orange-500 transition-colors">
              About
            </Link>
            <Link href="/pricing" className="block text-gray-700 hover:text-orange-500 transition-colors">
              Pricing
            </Link>
            <Link href="/legal/terms" className="block text-gray-700 hover:text-orange-500 transition-colors">
              Terms
            </Link>
            <Link href="/legal/privacy" className="block text-gray-700 hover:text-orange-500 transition-colors">
              Privacy
            </Link>
            <Link href="/help" className="block text-gray-700 hover:text-orange-500 transition-colors">
              Help
            </Link>
            
            {isAuthenticated ? (
              <>
                {(userRole === 'RESTAURANT_OWNER' || userRole === 'USER') && (
                  <Link href="/dashboard" className="block text-gray-700 hover:text-orange-500 transition-colors">
                    Dashboard
                  </Link>
                )}
                {userRole === 'ADMIN' && (
                  <Link href="/admin" className="block text-gray-700 hover:text-orange-500 transition-colors">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-500 transition-colors w-full"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block text-gray-700 hover:text-orange-500 transition-colors">
                  Sign in
                </Link>
                <Link href="/auth/register" className="block text-gray-700 hover:text-orange-500 transition-colors">
                  Sign up
                </Link>
                <Link
                  href="/dashboard"
                  className="block bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition text-center font-semibold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
