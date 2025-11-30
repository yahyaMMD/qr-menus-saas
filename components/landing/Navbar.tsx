// @ts-nocheck
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Try to load a cached user first
      const cached = localStorage.getItem('authUser') || localStorage.getItem('auth')
      if (cached) {
        try {
          setUser(JSON.parse(cached))
        } catch {}
      }

      // Determine an access token from common storage shapes
      let token = localStorage.getItem('accessToken')
      if (!token) {
        const authRaw = localStorage.getItem('authTokens') || localStorage.getItem('auth')
        if (authRaw) {
          try {
            const parsed = JSON.parse(authRaw)
            // support two shapes: { accessToken, refreshToken } or { tokens: { accessToken } }
            token = parsed?.accessToken ?? parsed?.tokens?.accessToken
          } catch {}
        }
      }

      if (!token) {
        setLoading(false)
        return
      }

      // Fetch current authenticated user using the auth API
      const response = await fetch('/api/auth?action=me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        try {
          localStorage.setItem('authUser', JSON.stringify(data.user))
        } catch {}
      } else {
        // invalid token — clear stale values
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('auth')
        localStorage.removeItem('authTokens')
        localStorage.removeItem('authUser')
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      const accessToken = localStorage.getItem('accessToken')

      await fetch('/api/auth?action=logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken, accessToken })
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('auth')
      setUser(null)
      router.push('/auth/login')
    }
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
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
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/#pricing" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              About
            </Link>
            <Link href="/help" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Help
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                    >
                      <User className="w-4 h-4" />
                      {user?.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/auth/login" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
                      Sign in
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-medium shadow-sm"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-3 border-t border-gray-100">
            <Link href="/#pricing" className="block text-gray-700 hover:text-orange-600 py-2 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="block text-gray-700 hover:text-orange-600 py-2 transition-colors">
              About
            </Link>
            <Link href="/help" className="block text-gray-700 hover:text-orange-600 py-2 transition-colors">
              Help
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <Link
                      href={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium"
                    >
                      <User className="w-4 h-4" />
                      {user?.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <Link href="/auth/login" className="block text-gray-700 hover:text-orange-600 py-2">
                      Sign in
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-center font-medium"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
