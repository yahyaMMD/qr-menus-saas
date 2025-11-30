// @ts-nocheck

import Image from 'next/image'
import menu1 from '@/public/assets/menu1-img.png'
import menu2 from '@/public/assets/menu2-img.png'
import menu3 from '@/public/assets/menu3-img.png'

export default function MenuShowcase() {
  const restaurants = [
    {
      name: 'Cozy Cafe',
      type: 'Coffee & Desserts',
      image: menu1,
    },
    {
      name: 'Pizza Palace',
      type: 'Italian Cuisine',
      image: menu2,
    },
    {
      name: 'Fine Dining',
      type: 'Gourmet Experience',
      image: menu3,
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Beautiful Menus for Every Style
          </h2>
          <p className="text-lg text-gray-600">
            See how different restaurants use Qresto
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {restaurants.map((restaurant, index) => (
            <div
              key={index}
              className="group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-4 border-white hover:border-orange-200"
            >
              {/* Restaurant Image */}
              <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center relative overflow-hidden">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
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
      </div>
    </section>
  )
}
