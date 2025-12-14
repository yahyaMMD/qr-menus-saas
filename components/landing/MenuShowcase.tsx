// @ts-nocheck
'use client';

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import Link from 'next/link'
import menu1 from '@/public/assets/menu1-img.png'
import menu2 from '@/public/assets/menu2-img.png'
import menu3 from '@/public/assets/menu3-img.png'

export default function MenuShowcase() {
  const { isAuthenticated } = useAuth();
  const [restaurants, setRestaurants] = useState([
    {
      name: 'Cozy Cafe',
      type: 'Coffee & Desserts',
      image: menu1,
      logo: null,
    },
    {
      name: 'Pizza Palace',
      type: 'Italian Cuisine',
      image: menu2,
      logo: null,
    },
    {
      name: 'Fine Dining',
      type: 'Gourmet Experience',
      image: menu3,
      logo: null,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const galleryLink = isAuthenticated ? '/dashboard/profiles' : '/auth/register';

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/profiles/public?limit=3');
        if (response.ok) {
          const data = await response.json();
          if (data.profiles && data.profiles.length > 0) {
            const formattedRestaurants = data.profiles.map((profile: any, index: number) => ({
              name: profile.name,
              type: profile.description || 'Restaurant',
              image: profile.logo || [menu1, menu2, menu3][index % 3],
              logo: profile.logo,
            }));
            setRestaurants(formattedRestaurants);
          }
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [])

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
              Gallery
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            See What You Can Create
          </h2>
          <p className="text-lg text-gray-600">
            Discover restaurants already using{' '}
            <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent font-semibold">
              Qresto
            </span>
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href={galleryLink}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              Explore the Gallery
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {restaurants.map((restaurant, index) => (
              <Link
                key={index}
                href={galleryLink}
                className="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-orange-200 relative bg-white hover:-translate-y-2"
              >
                {/* Restaurant Image */}
                <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center relative overflow-hidden">
                  {restaurant.logo ? (
                    <img
                      src={restaurant.logo}
                      alt={restaurant.name}
                      className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${!isAuthenticated ? 'blur-sm' : ''}`}
                    />
                  ) : (
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className={`object-cover transition-all duration-500 group-hover:scale-110 ${!isAuthenticated ? 'blur-sm' : ''}`}
                    />
                  )}
                  
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badge */}
                  {!isAuthenticated && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      {restaurant.menus?.length || index + 1} Menu{(restaurant.menus?.length || index + 1) > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className={`bg-white p-6 transition-all duration-300 ${!isAuthenticated ? 'opacity-75' : ''}`}>
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-600">{restaurant.type}</p>
                  
                  {/* View button on hover */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-orange-600 font-semibold text-sm flex items-center gap-2">
                      View Menu
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Unlock the Gallery CTA */}
        {!isAuthenticated && (
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-12 text-center shadow-xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-200/30 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-orange-300/30 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg 
                    className="w-10 h-10 text-white" 
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
                  🔓 Unlock the Gallery
                </h3>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Sign up as a user to explore real restaurant menus created with Qresto and see what&apos;s possible for your business
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/auth/register" 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform"
                  >
                    Get Started
                  </Link>
                  <Link 
                    href="/auth/login" 
                    className="border-2 border-orange-500 text-orange-600 px-8 py-3 rounded-xl hover:bg-orange-500 hover:text-white transition-all duration-300 font-semibold"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
