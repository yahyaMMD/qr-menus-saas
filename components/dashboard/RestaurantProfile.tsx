// @ts-nocheck
"use client";
import { useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "../ui/button";
import { 
  Plus, 
  QrCode, 
  BarChart3, 
  Settings,
  Eye,
  Pencil,
  Trash2,
  Download,
  Share2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const RestaurantProfile = ({ profileId }: { profileId: string }) => {
  const restaurant = {
    id: profileId,
    name: "The Green Leaf Cafe",
    description: "A cozy cafe serving organic and locally sourced ingredients",
    location: "Algiers, Algeria",
    image: "/assets/menu1-img.png",
    activeMenus: 2,
    totalScans: 1234,
  };

  const menus = [
    {
      id: "menu1",
      name: "Main Menu",
      description: "Our signature dishes and beverages",
      itemCount: 24,
      lastUpdated: "2 days ago",
      isActive: true,
      scans: 856,
    },
    {
      id: "menu2",
      name: "Breakfast Menu",
      description: "Morning specials available until 11 AM",
      itemCount: 12,
      lastUpdated: "1 week ago",
      isActive: true,
      scans: 378,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        {/* Restaurant Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {restaurant.name}
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 mb-1">{restaurant.description}</p>
                  <p className="text-xs md:text-sm text-gray-500">{restaurant.location}</p>
                </div>

                <div className="flex items-center gap-3 md:ml-4">
                  <Link href={`/dashboard/profiles/${profileId}/settings`}>
                    <Button variant="outline" className="gap-2 hidden md:flex">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md">
                      <Plus className="h-4 w-4 mr-2 inline" />
                      Add Restaurant
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-sm text-gray-600">Total Scans Today</p>
                  <p className="text-2xl font-bold text-gray-900">342</p>
                  <p className="text-xs text-green-600">+12% from yesterday</p>
                </div>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-sm text-gray-600">Feedback This Week</p>
                  <p className="text-2xl font-bold text-gray-900">28</p>
                  <p className="text-xs text-green-600">+8% from last week</p>
                </div>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-sm text-gray-600">Active Menus</p>
                  <p className="text-2xl font-bold text-gray-900">{restaurant.activeMenus}</p>
                  <p className="text-xs text-gray-600">Across 2 restaurants</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menus Section */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Menus</h2>
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/profiles/${profileId}/menus/new`}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                <Plus className="h-4 w-4" />
                Create New Menu
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{menu.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{menu.description}</p>
                  </div>
                  {menu.isActive && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
                  )}
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Items</span>
                    <span className="font-semibold text-gray-900">{menu.itemCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Scans</span>
                    <span className="font-semibold text-gray-900">{menu.scans}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-900">{menu.lastUpdated}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/dashboard/profiles/${profileId}/menus/${menu.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-1"> <Pencil className="h-3 w-3" /> Edit</Button>
                  </Link>
                  <Link href={`/menu/${profileId}/${menu.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-1"> <Eye className="h-3 w-3" /> Preview</Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full gap-1"> <QrCode className="h-3 w-3" /> QR Code</Button>
                  <Link href={`/dashboard/profiles/${profileId}/menus/${menu.id}/analytics`}>
                    <Button variant="outline" size="sm" className="w-full gap-1"> <BarChart3 className="h-3 w-3" /> Analytics</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Menu Card */}
          <Link href={`/dashboard/profiles/${profileId}/menus/new`}>
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden hover:border-gray-400 transition-colors cursor-pointer h-full min-h-[260px]">
              <div className="h-full flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Menu</h3>
                <p className="text-sm text-gray-600 text-center">Add a new menu for your restaurant</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};
