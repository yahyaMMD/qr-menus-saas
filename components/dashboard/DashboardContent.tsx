// @ts-nocheck
"use client";
import { useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "../ui/button";
import { Plus, BarChart3, MessageSquare, TrendingUp, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const DashboardContent = () => {
  const stats = [
    {
      title: "Total Scans Today",
      value: "342",
      change: "+12% from yesterday",
      changeType: "positive",
      icon: BarChart3,
    },
    {
      title: "Feedback This Week",
      value: "28",
      change: "+8% from last week",
      changeType: "positive",
      icon: MessageSquare,
    },
    {
      title: "Active Menus",
      value: "3",
      subtitle: "Across 2 restaurants",
      icon: TrendingUp,
    },
  ];

  const restaurants = [
    {
      id: 1,
      name: "The Green Leaf Cafe",
      location: "Algiers, Algeria",
      image: "/assets/menu1-img.png",
      activeMenus: 2,
      totalScans: 1234,
    },
    {
      id: 2,
      name: "La Pizzeria",
      location: "Oran, Algeria",
      image: "/assets/menu2-img.png",
      activeMenus: 1,
      totalScans: 856,
    },
  ];

  const quickActions = [
    {
      title: "Create New Profile",
      icon: Plus,
      href: "/dashboard/profiles/new",
    },
    {
      title: "View Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
    },
    {
      title: "Manage Subscription",
      icon: TrendingUp,
      href: "/dashboard/settings",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, John!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your restaurants today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-gray-600 text-sm">{stat.title}</span>
                <stat.icon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  {stat.value}
                </span>
              </div>
              {stat.change && (
                <p
                  className={`text-sm ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {stat.change}
                </p>
              )}
              {stat.subtitle && (
                <p className="text-sm text-gray-600">{stat.subtitle}</p>
              )}
            </div>
          ))}
        </div>

        {/* Your Restaurants Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Restaurants
            </h2>
            <Link href="/dashboard/profiles/new">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-5 w-5 mr-2" />
                Add Restaurant
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-200 relative">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {restaurant.location}
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Active Menus</span>
                      <span className="font-semibold text-gray-900">
                        {restaurant.activeMenus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Scans</span>
                      <span className="font-semibold text-gray-900">
                        {restaurant.totalScans.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/profiles/${restaurant.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Manage
                      </Button>
                    </Link>
                    <Link href={`/dashboard/profiles/${restaurant.id}/analytics`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Restaurant Card */}
            <Link href="/dashboard/profiles/new">
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden hover:border-gray-400 transition-colors cursor-pointer">
                <div className="h-full flex flex-col items-center justify-center p-6 min-h-[400px]">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Add New Restaurant
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    Create a new restaurant profile
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Common tasks to manage your restaurants
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <button
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
                >
                  <action.icon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">{action.title}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
