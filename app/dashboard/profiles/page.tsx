// @ts-nocheck
"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, MessageSquare, BarChart3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProfilesPage() {
  const stats = {
    totalRestaurants: 3,
    totalMenus: 6,
    totalViews: 4431,
    activeMenus: 3,
  };

  const restaurants = [
    {
      id: 1,
      name: "The Green Leaf Cafe",
      location: "Algiers, Algeria",
      image: "/assets/menu1-img.png",
      totalViews: 2234,
      totalScans: 1234,
      rating: 4.5,
    },
    {
      id: 2,
      name: "La Pizzeria",
      location: "Oran, Algeria",
      image: "/assets/menu2-img.png",
      totalViews: 1341,
      totalScans: 856,
      rating: 4.8,
    },
    {
      id: 3,
      name: "Sushi Master",
      location: "Constantine, Algeria",
      image: "/assets/menu1-img.png",
      totalViews: 856,
      totalScans: 543,
      rating: 4.7,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Restaurants</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage all your restaurant profiles and menus
            </p>
          </div>
          <Link href="/dashboard/profiles/new">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Add New Restaurant
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs text-gray-600 mb-2">Total Restaurants</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalRestaurants}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs text-gray-600 mb-2">Total Menus</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalMenus}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs text-gray-600 mb-2">Total Views</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="text-xs text-gray-600 mb-2">Active Menus</div>
            <div className="text-3xl font-bold text-gray-900">{stats.activeMenus}</div>
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Restaurant Image */}
              <div className="relative w-full h-40">
                <Image
                  src={restaurant.image}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Restaurant Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {restaurant.name}
                    </h3>
                    <div className="text-xs text-gray-600">
                      {restaurant.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 ml-2">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {restaurant.rating}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 mb-3">
                  Inclusive Restaurants and desserts menus
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="text-xs text-gray-600">Total Views</div>
                    <div className="text-sm font-bold text-gray-900">
                      {restaurant.totalViews.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Total Scans</div>
                    <div className="text-sm font-bold text-gray-900">
                      {restaurant.totalScans}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/dashboard/profiles/${restaurant.id}/menus/menu1`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/dashboard/profiles/${restaurant.id}/analytics`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                    >
                      <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href={`/dashboard/profiles/${restaurant.id}/feedbacks`} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                      Feedbacks
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Restaurant Card */}
          <Link href="/dashboard/profiles/new">
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-400 transition-colors h-full min-h-[380px] flex items-center justify-center cursor-pointer">
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Add New Restaurant
                </h3>
                <p className="text-xs text-gray-600">
                  Create a new restaurant profile
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
