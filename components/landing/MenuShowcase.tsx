// @ts-nocheck
'use client';

import Image from 'next/image'
import { useState, useEffect } from 'react'
import menu1 from '@/public/assets/menu1-img.png'
import menu2 from '@/public/assets/menu2-img.png'
import menu3 from '@/public/assets/menu3-img.png'

export default function MenuShowcase() {
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

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        // Fetch real restaurant profiles - public API
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
        // Keep default restaurants if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [])

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {restaurants.map((restaurant, index) => (
              <div
                key={index}
                className="group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-4 border-white hover:border-orange-200"
              >
                {/* Restaurant Image */}
                <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center relative overflow-hidden">
                  {restaurant.logo ? (
                    <img
                      src={restaurant.logo}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={restaurant.image}
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Card Content */}
                <div className="bg-white p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {restaurant.name}
                  </h3>
                  <p className="text-gray-600">{restaurant.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section Header */}
        <div className="text-center mb-12 mt-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            See What You Can Create
          </h2>
          <p className="text-lg text-gray-600">
            Sign up to explore real restaurant menus and see the possibilities
          </p>
        </div>

        {/* Unlock the Gallery CTA */}
        <div className="mt-16 max-w-2xl mx-auto">
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
              <button className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition font-semibold">
                Get Started
              </button>
              <button className="border-2 border-gray-300 text-gray-900 px-8 py-3 rounded-lg hover:bg-gray-50 transition font-semibold">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
