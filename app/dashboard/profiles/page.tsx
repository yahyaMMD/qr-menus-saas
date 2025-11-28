'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp, Users, Eye, MoreVertical, Trash2, Edit } from 'lucide-react';

const mockRestaurants = [
  {
    id: '1',
    name: 'The Green Leaf Café',
    logo: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=100&h=100&fit=crop',
    location: 'Mahelma 03, Mahelma',
    activeMenus: 3,
    totalScans: 1154,
    avgRating: 4.6,
    reviews: 89
  },
  {
    id: '2',
    name: 'La Pizzeria',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop',
    location: 'Mahelma 04, Mahelma',
    activeMenus: 2,
    totalScans: 2431,
    avgRating: 4.8,
    reviews: 156
  },
  {
    id: '3',
    name: 'Sushi Haven',
    logo: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop',
    location: 'Lab09, G8',
    activeMenus: 1,
    totalScans: 856,
    avgRating: 4.7,
    reviews: 64
  }
];

export default function MyRestaurantsPage() {
  const router = useRouter();
  const [restaurants] = useState(mockRestaurants);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const RestaurantCard = ({ restaurant }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          <img
            src={restaurant.logo}
            alt={restaurant.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
            <p className="text-sm text-gray-500">{restaurant.location}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(showMenu === restaurant.id ? null : restaurant.id)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
            {showMenu === restaurant.id && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Total Scans</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{restaurant.totalScans.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1">+12% this month</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">Reviews</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{restaurant.reviews}</div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-lg text-yellow-500">★</span>
            <span className="text-xs text-gray-600">{restaurant.avgRating} avg</span>
          </div>
        </div>
      </div>

      {/* Active Menus */}
      <div className="px-6 pb-6">
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">Active Menus</span>
              <div className="text-3xl font-bold text-gray-900 mt-1">{restaurant.activeMenus}</div>
            </div>
            <TrendingUp className="w-8 h-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-4 flex gap-3">
        <button
          onClick={() => router.push(`/dashboard/profiles/${restaurant.id}/analytics`)}
          className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          Analytics
        </button>
        <button
          onClick={() => router.push(`/dashboard/profiles/${restaurant.id}/menus`)}
          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
        >
          Manage
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Restaurants</h1>
        <p className="text-gray-600">Manage all your restaurant profiles and menus</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Total Restaurants</div>
          <div className="text-4xl font-bold">{restaurants.length}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Total Menus</div>
          <div className="text-4xl font-bold">
            {restaurants.reduce((sum, r) => sum + r.activeMenus, 0)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Total Scans</div>
          <div className="text-4xl font-bold">
            {restaurants.reduce((sum, r) => sum + r.totalScans, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Add New Restaurant Button */}
      <button
        onClick={() => router.push('/dashboard/profiles/new')}
        className="w-full mb-6 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-orange-600 font-medium"
      >
        <Plus className="w-5 h-5" />
        Add New Restaurant
      </button>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
}