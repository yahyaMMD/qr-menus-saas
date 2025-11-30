// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function MenuShowcase() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      try {
        const authRaw = localStorage.getItem('auth')
        if (authRaw) {
          const auth = JSON.parse(authRaw)
          setIsAuthenticated(!!auth?.tokens?.accessToken)
        }
      } catch (err) {
        setIsAuthenticated(false)
      }
    }

    checkAuth()
    // Listen for auth changes
    window.addEventListener('storage', checkAuth)
    return () => window.removeEventListener('storage', checkAuth)
  }, [])

  const restaurants = [
    {
      name: 'The Green Leaf Cafe',
      type: 'Coffee & Pastries',
      location: 'Hydra, Algiers',
      menus: 2,
      image: '/assets/menu1-img.png',
    },
    {
      name: 'Pizza Palace',
      type: 'Italian Cuisine',
      location: 'Oran',
      menus: 3,
      image: '/assets/menu2-img.png',
    },
    {
      name: 'Le Gourmet',
      type: 'Fine Dining',
      location: 'Constantine',
      menus: 4,
      image: '/assets/menu3-img.png',
    },
    {
      name: 'Sushi Master',
      type: 'Japanese Cuisine',
      location: 'Algiers',
      menus: 2,
      image: '/assets/menu1-img.png',
    },
    {
      name: 'Burger House',
      type: 'American Fast Food',
      location: 'Annaba',
      menus: 1,
      image: '/assets/menu2-img.png',
    },
    {
      name: 'Mediterranean Delight',
      type: 'Mediterranean Cuisine',
      location: 'Tlemcen',
      menus: 4,
      image: '/assets/menu3-img.png',
    },
  ]

  // Logged Out View - Lock Screen
  if (!isAuthenticated) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See What You Can Create
            </h2>
            <p className="text-lg text-gray-600">
              Discover restaurants already using Qresto
            </p>
          </div>

          {/* Blurred Preview Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 opacity-40 blur-sm pointer-events-none">
            {restaurants.slice(0, 3).map((restaurant, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden shadow-lg border-4 border-white"
              >
                <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center relative overflow-hidden">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="bg-white p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-600">{restaurant.type}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Unlock the Gallery CTA */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <svg 
                  className="w-8 h-8 text-orange-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" 
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Unlock the Gallery
              </h3>
              <p className="text-gray-600 mb-8">
                Sign up as a user to explore real restaurant menus created with Qresto and see what's possible for your business
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/dashboard"
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  Get Started
                </Link>
                <Link 
                  href="/auth/login"
                  className="border-2 border-gray-300 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Logged In View - Full Gallery
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            See What You Can Create
          </h2>
          <p className="text-lg text-gray-600">
            Discover restaurants already using Qresto
          </p>
        </div>

        {/* Full Restaurant Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {restaurants.map((restaurant, index) => (
            <div
              key={index}
              className="group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-200 hover:border-orange-300 bg-white"
            >
              {/* Restaurant Image with Badge */}
              <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Menu Count Badge */}
                <div className="absolute top-3 right-3 bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {restaurant.menus} Menu{restaurant.menus > 1 ? 's' : ''}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">
                  {restaurant.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{restaurant.type}</p>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {restaurant.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
