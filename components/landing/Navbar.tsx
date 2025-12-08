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
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const checkAuth = async () => {
    try {
      const cached = localStorage.getItem('authUser') || localStorage.getItem('auth')
      if (cached) {
        try {
          setUser(JSON.parse(cached))
        } catch {}
      }

      let token = localStorage.getItem('accessToken')
      if (!token) {
        const authRaw = localStorage.getItem('authTokens') || localStorage.getItem('auth')
        if (authRaw) {
          try {
            const parsed = JSON.parse(authRaw)
            token = parsed?.accessToken ?? parsed?.tokens?.accessToken
          } catch {}
        }
      }

      if (!token) {
        setLoading(false)
        return
      }

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
      localStorage.removeItem('authTokens')
      localStorage.removeItem('authUser')
      setUser(null)
      setIsOpen(false)
      router.push('/')
    }
  }

  return (
    <nav className={`bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'border-gray-200 shadow-lg' : 'border-gray-100 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden text-gray-700 hover:text-orange-600 transition-colors p-1 rounded-lg hover:bg-orange-50" 
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent hover:from-orange-700 hover:to-orange-600 transition-all">
              Qresto
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/#pricing" className="text-gray-600 hover:text-orange-600 transition-all font-medium relative group">
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-orange-600 transition-all font-medium relative group">
              About
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/help" className="text-gray-600 hover:text-orange-600 transition-all font-medium relative group">
              Help
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <Link
                      href={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:scale-105 transform"
                    >
                      <User className="w-4 h-4" />
                      {user?.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/auth/login" className="text-gray-600 hover:text-orange-600 transition-all font-medium relative group">
                      Sign in
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg hover:scale-105 transform"
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
          <div className="lg:hidden py-4 space-y-2 border-t border-gray-100 animate-in slide-in-from-top duration-300">
            <Link 
              href="/#pricing" 
              className="block text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2.5 rounded-lg transition-all font-medium"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              className="block text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2.5 rounded-lg transition-all font-medium"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/help" 
              className="block text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2.5 rounded-lg transition-all font-medium"
              onClick={() => setIsOpen(false)}
            >
              Help
            </Link>
            
            {!loading && (
              <>
                {user ? (
                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <Link
                      href={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium shadow-md"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      {user?.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <Link 
                      href="/auth/login" 
                      className="block text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-3 py-2.5 rounded-lg transition-all font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-center font-medium shadow-md"
                      onClick={() => setIsOpen(false)}
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