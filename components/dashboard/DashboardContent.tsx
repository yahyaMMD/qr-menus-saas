// @ts-nocheck
"use client";
import { useState } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { Button } from "../ui/button";
import { Plus, BarChart3, MessageSquare, TrendingUp, MapPin, Pencil } from "lucide-react";
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
      location: "Mahelma 03, Mahelma",
      image: "/assets/menu1-img.png",
      activeMenus: 2,
      totalScans: 1234,
    },
    {
      id: 2,
      name: "La Pizzeria",
      location: "Mahelma 04, Mahelma",
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
      <div className="p-5">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, 3ziwez!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your restaurants today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 text-sm">{stat.title}</span>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="mb-1">
                <span className="text-3xl font-bold text-gray-900">
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-5">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col"
              >
                <div className="h-32 bg-gray-200 relative flex-shrink-0">
                  <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-gray-900 mb-0.5">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <MapPin className="h-3.5 w-3.5 mr-0.5" />
                    {restaurant.location}
                  </div>
                  <div className="space-y-1.5 mb-3 text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Menus</span>
                      <span className="font-semibold text-gray-900">
                        {restaurant.activeMenus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Scans</span>
                      <span className="font-semibold text-gray-900">
                        {restaurant.totalScans}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Link href={`/dashboard/profiles/${restaurant.id}/menus/menu1`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-8 text-xs"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/dashboard/profiles/${restaurant.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-8 text-xs"
                      >
                        Manage
                      </Button>
                    </Link>
                    <Link href={`/dashboard/profiles/${restaurant.id}/analytics`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-8 text-xs"
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
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex items-center justify-center" style={{minHeight: '280px'}}>
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <Plus className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                    Add New Restaurant
                  </h3>
                  <p className="text-xs text-gray-500">
                    Create a new<br />restaurant profile
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Quick Actions
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Common tasks to manage your restaurants
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <button
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
                >
                  <action.icon className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-900 font-medium text-sm">{action.title}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
