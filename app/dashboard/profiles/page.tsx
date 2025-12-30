'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp, Users, Eye, MoreVertical, Trash2, Edit } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  location?: any;
  description?: string;
  _count?: {
    menus: number;
    feedbacks: number;
  };
  menus?: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
}

export default function MyRestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/api/profiles?list=restaurants', {
          credentials: 'include',
        });
        const data = await response.json();

        if (response.ok) {
          setRestaurants(data.profiles);
        } else {
          console.error('Failed to fetch profiles:', data.error);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
    const activeMenusCount = restaurant.menus?.filter(m => m.isActive).length || 0;
    const locationText = restaurant.location?.address || restaurant.location?.city || 'No location set';

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-600">
                  {restaurant.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{restaurant.name}</h3>
              <p className="text-sm text-gray-500">{locationText}</p>
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
                  <button
                    onClick={() => {
                      router.push(`/dashboard/profiles/${restaurant.id}/settings`);
                      setShowMenu(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${restaurant.name}?`)) {
                        // TODO: Call delete API
                        setRestaurants(restaurants.filter(r => r.id !== restaurant.id));
                      }
                      setShowMenu(null);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
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
              <span className="text-xs text-blue-600 font-medium">Total Menus</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {restaurant._count?.menus || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {activeMenusCount} active
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">Feedbacks</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {restaurant._count?.feedbacks || 0}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-lg text-yellow-500">★</span>
              <span className="text-xs text-gray-600">4.5 avg</span>
            </div>
          </div>
        </div>

        {/* Active Menus */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600">Active Menus</span>
                <div className="text-3xl font-bold text-gray-900 mt-1">
                  {activeMenusCount}
                </div>
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
          <button
            onClick={() => router.push(`/dashboard/profiles/${restaurant.id}/feedbacks`)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
          >
            Feedbacks
          </button>
        </div>
      </div>
    );
  };

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
            {restaurants.reduce((sum, r) => sum + (r._count?.menus || 0), 0)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Active Menus</div>
          <div className="text-4xl font-bold">
            {restaurants.reduce((sum, r) => {
              const active = r.menus?.filter(m => m.isActive).length || 0;
              return sum + active;
            }, 0)}
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
      {restaurants.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants yet</h3>
          <p className="text-gray-600 mb-4">Create your first restaurant profile to get started</p>
          <button
            onClick={() => router.push('/dashboard/profiles/new')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Create Restaurant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}
